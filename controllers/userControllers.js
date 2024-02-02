import userModel from "../models/userModel.js";


import { hashPassword, comparePassword } from "../utils/authHelper.js";
import JWT from 'jsonwebtoken';
import { generatePdf } from "pdf-master";

export const registerController = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        //validations
        if (!name || !email || !password) {
            return res.send({ error: "All Fileds are  Required" });
        }

        //check user
        const exisitingUser = await userModel.findOne({ email });
        //exisiting user
        if (exisitingUser) {
            return res.status(200).send({
                success: false,
                message: "Already Register please login",
            });
        }
        //register user
        const hashedPassword = await hashPassword(password);
        //save
        const user = await new userModel({
            name,
            email,
            password: hashedPassword,
        }).save();

        res.status(201).send({
            success: true,
            message: "User Register Successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Errro in Registeration",
            error,
        });
    }
};


export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;


        console.log(email, password);

        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: "Invalid email or password",
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "Email is not registerd",
            });
        }


        const match = await comparePassword(password, user.password);
        console.log("match", match);
        if (!match) {
            return res.status(200).send({
                success: false,
                message: "Invalid Password",
            });
        }


        const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });


        res.status(200).send({
            success: true,
            message: "login successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,

            },
            token,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in Login",
            error,
        })
    }
}


export const generatePdfController = async (req, res) => {
    try {
        var students = [
            {
                id: 1,
                name: "Sam",
                age: 21
            },
            {
                id: 2,
                name: "Jhon",
                age: 20
            },
            {
                id: 3,
                name: "Jim",
                age: 24
            }
        ]

        let options = {
            displayHeaderFooter: true,
            format: "A4",
            headerTemplate: `<h3> Header </h3>`,
            footerTemplate: `<h3> Copyright 2023 </h3>`,
            margin: { top: "80px", bottom: "100px" },
        };

        let PDF = await generatePdf("template.hbs", students, options);
        res.contentType("application/pdf");
        res.status(200).send(PDF);
    } catch (error) {
        console.log("error ", error);
    }

}