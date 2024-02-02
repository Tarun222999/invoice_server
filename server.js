import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import connectDB from './db.js';
import userRoute from './routes/userRoute.js'

import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import hbs from 'handlebars';
import moment from 'moment';
import path from 'path';
import mongoose from "mongoose";
dotenv.config();
const PORT = process.env.PORT;

connectDB();
const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(express.json());


app.use("/api/user", userRoute);


const PdfDocument = mongoose.model('PdfDocument', new mongoose.Schema({
    bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
    pdfBuffer: Buffer,
}));


const compile = async function (templateName, data) {
    const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
    const html = await fs.readFile(filePath, 'utf8');
    return hbs.compile(html)(data);
}

hbs.registerHelper('dateFormat', function (value, format) {
    return moment(value).format(format);
});
app.get("/", (req, res) => {
    res.send('puppeter is up and running');
})
app.post("/api/generate-pdf", async (req, res) => {
    try {


        const { userId, ...bill } = req.body;
        console.log("bill", bill);


        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            headless: 'new'
        });

        const page = await browser.newPage();

        const content = await compile('shot-list', bill);

        await page.setContent(content);

        await page.emulateMediaType('screen');
        const pdfBuffer = await page.pdf({
            path: "mypdf.pdf",
            format: 'A4',
            printBackground: true
        });

        const newPdfDocument = new PdfDocument({
            bill: userId,  // Replace with the actual ObjectId of the bill
            pdfBuffer: pdfBuffer,
        });

        await newPdfDocument.save();

        // var pdf = fs.readFileSync('mypdf.pdf');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=mypdf.pdf');

        res.contentType("application/pdf");
        // res.send(pdf);
        res.send(pdfBuffer);


        console.log('PDF generated and sent to the client');
        await browser.close();
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(PORT, () => {
    console.log(`Server is Up and Running on ${PORT}`)
});