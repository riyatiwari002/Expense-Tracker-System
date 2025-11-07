import express from 'express';
import {addTransaction,deleteTransaction,getAllTransaction,updateTransaction} from '../controllers/transactionController.js';

const transRoutes = express.Router();

transRoutes.post('/addTransaction', addTransaction);
transRoutes.get('/getAllTransaction',getAllTransaction);
transRoutes.put('/updateTransaction/:id',updateTransaction);
transRoutes.delete('/deleteTransaction/:id',deleteTransaction)

export default transRoutes;
