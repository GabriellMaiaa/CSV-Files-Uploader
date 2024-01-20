import express, { Request, Response } from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import csvParser from 'csv-parser';
import fs from 'fs';2

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:4000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const fileName = path.parse(file.originalname).name;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${fileName}-${uniqueSuffix}.csv`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only CSV files are accepted.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

let csvData: any[] = [];

app.post('/files', upload.single('csvFile'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file sent.' });
    }

    const filePath = req.file.path;

    const data: any[] = [];
    // Process CSV file
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        data.push(row);
      })
      .on('end', () => {
        console.log('CSV Content:', data);
        res.status(200).json({ message: 'Upload successful!', data });
      });

  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/users', (req: Request, res: Response) => {
  try {
    const searchTerm: string = req.query.q?.toString() || '';

    if (!searchTerm) {
      return res.status(400).json({ message: 'The ?q= query parameter is required.' });
    }

    const filteredData = csvData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    res.status(200).json({ data: filteredData });
  } catch (error) {
    console.error('Error during a search for users:', error);
    res.status(500).json({ message: 'Internal server error during search.' });
  }
});

app.listen(port, () => {
  console.log(`Server is being listened to on the port ${port}`);
});