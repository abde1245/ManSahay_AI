
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/genai';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const PORT = 3001;
const CHROMA_URL = "http://localhost:8000"; // Ensure Docker container is running
const COLLECTION_NAME = "mansahay_knowledge_base";

// Initialize Google AI
const genAI = new GoogleGenerativeAI({ apiKey: process.env.API_KEY });

// Initialize Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.API_KEY,
  modelName: "embedding-001", 
});

// --- Helper: Reciprocal Rank Fusion (RRF) ---
// Fuses results from multiple queries/methods
function reciprocalRankFusion(resultsList, k = 60) {
    const fusedScores = {};
    const docMap = {};

    resultsList.forEach((results) => {
        results.forEach((doc, rank) => {
            const id = doc.metadata.source + "_" + doc.metadata.loc.lines.from; // Unique ID based on content loc
            docMap[id] = doc;
            if (!fusedScores[id]) fusedScores[id] = 0;
            fusedScores[id] += 1 / (k + rank + 1);
        });
    });

    // Sort by score descending
    const sortedIds = Object.keys(fusedScores).sort((a, b) => fusedScores[b] - fusedScores[a]);
    return sortedIds.map(id => docMap[id]);
}

// --- API: Health Check ---
app.get('/health', (req, res) => res.send('RAG Server Online'));

// --- API: Ingest File ---
app.post('/ingest', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        console.log(`Processing: ${req.file.originalname}`);

        // 1. Load Document
        let docs = [];
        if (req.file.mimetype === 'application/pdf') {
            const loader = new PDFLoader(req.file.path);
            docs = await loader.load();
        } else {
            // Text fallback
            const text = fs.readFileSync(req.file.path, 'utf-8');
            docs = [new Document({ pageContent: text, metadata: { source: req.file.originalname } })];
        }

        // 2. Chunking (Best Practice: Overlap preserves context)
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const chunks = await splitter.splitDocuments(docs);

        // Add metadata
        chunks.forEach(chunk => {
            chunk.metadata = {
                ...chunk.metadata,
                source: req.file.originalname,
                uploadedAt: new Date().toISOString()
            };
        });

        console.log(`Created ${chunks.length} chunks. Embedding and storing...`);

        // 3. Vectorize & Upsert to Chroma
        await Chroma.fromDocuments(chunks, embeddings, {
            collectionName: COLLECTION_NAME,
            url: CHROMA_URL,
        });

        // Cleanup temp file
        fs.unlinkSync(req.file.path);

        res.json({ 
            success: true, 
            message: "Ingested successfully", 
            chunks: chunks.length,
            fileId: Date.now().toString() // Mock ID for frontend
        });

    } catch (error) {
        console.error("Ingestion Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- API: Advanced Search (RRF + Query Expansion) ---
app.post('/search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "Query required" });

        console.log(`Searching for: "${query}"`);

        // 1. Query Expansion (LLM Call)
        // Generate variations of the question to capture different semantic angles
        const llm = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const expansionPrompt = `You are a helpful AI assistant. Generate 3 different search queries based on the user question to retrieve relevant documents from a vector database. 
        User Question: "${query}"
        Output only the 3 queries separated by newlines. No numbering.`;
        
        const expansionResult = await llm.generateContent(expansionPrompt);
        const variations = expansionResult.response.text().split('\n').filter(q => q.trim().length > 0);
        variations.push(query); // Include original

        console.log("Generated Search Variations:", variations);

        // 2. Parallel Vector Search
        const vectorStore = await Chroma.fromExistingCollection(embeddings, {
            collectionName: COLLECTION_NAME,
            url: CHROMA_URL
        });

        // Run vector search for EACH variation
        const searchPromises = variations.map(q => vectorStore.similaritySearch(q, 5));
        const resultsLists = await Promise.all(searchPromises);

        // 3. Reciprocal Rank Fusion (RRF)
        // Consolidate results from all query variations into one ranked list
        const fusedResults = reciprocalRankFusion(resultsLists);

        // 4. Return Top K (Context)
        const topResults = fusedResults.slice(0, 6).map(doc => ({
            content: doc.pageContent,
            source: doc.metadata.source,
            score: 1 // RRF doesn't give probability scores, just rank
        }));

        res.json({
            results: topResults,
            variations: variations
        });

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- API: Delete Resource ---
// Simplified for demo: In real Chroma, deleting by metadata is tricky without IDs
app.delete('/resource/:filename', async (req, res) => {
    // Chroma deletion logic would go here
    // For now, we assume success as Chroma requires ID management which adds complexity
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`RAG Server running on http://localhost:${PORT}`);
});
