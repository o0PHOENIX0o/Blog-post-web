import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 5000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const upload = multer({ storage: storage });
const dbPath = path.resolve(__dirname, 'postData.json');

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

let prefix;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, './public/images/Blogs');
    },
    filename: function (req, file, cb) { // cb = callback
        prefix = Date.now();
        return cb(null, `${prefix}-${file.originalname}`);
    }
});



function readData() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

function writeData(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

app.post('/submit', upload.single('image'), function (req, res) {
    console.log(req.file, req.body);
    const newData = {
        "img": `/images/Blogs/${prefix}-${req.file.originalname}`,
        "title": req.body.title,
        "content": req.body.postContent
    };

    const data = readData();
    data.push(newData);
    writeData(data);

    return res.redirect("/");
});

app.get("/", (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) throw err;
        const blogData = JSON.parse(data);
        res.render("index.ejs", { data: blogData });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
