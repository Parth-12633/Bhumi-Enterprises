import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import employeeRoutes from './routes/employeeRoutes';
import siteRoutes from './routes/siteRoutes';
import workRecordRoutes from './routes/workRecordRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reportRoutes from './routes/reportRoutes';
import activityRoutes from './routes/activityRoutes';
import rateRoutes from './routes/rateRoutes';
import publicRoutes from './routes/publicRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/work-records', workRecordRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/public', publicRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

export default app;
