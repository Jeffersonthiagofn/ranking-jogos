import express from 'express';
import { autoIngestIfEmpty } from '../services/steamService.js';
import { requireAdminSecret } from '../middleware/adminAuth.js'; 

const router = express.Router();

router.get('/ingest-steam-ids', requireAdminSecret, async (req, res) => {
    try {
        console.log("Admin triggered manual DB health check/ingestion...");
        const result = await autoIngestIfEmpty();
        
        res.json({
            message: "Ingestion process finished.", 
            details: result 
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Ingestion failed"});
    }
});

export default router;