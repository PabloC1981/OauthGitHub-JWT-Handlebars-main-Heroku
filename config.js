import dotenv from 'dotenv';
dotenv.config();

export default {
    github:{
        CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET
    },
    mongo:{
        URL:process.env.MONGO_URL,
        PORT:process.env.PORT,
        DB_HOST:process.env.DB_HOST,
        DB_NAME:process.env.DB_NAME,
        DB_USER:process.env.DB_USER,
        DB_PASSWORD:process.env.DB_PASSWORD,
        dialect: "mongo",
        dialectOptions:{
            ssl:{
                require:true,
                rejectUnauthorized: false,
            },
        },
    },
    jwt:{
        COOKIE_NAME:process.env.JWT_COOKIE_NAME,
        SECRET:process.env.JWT_SECRET
    }
}