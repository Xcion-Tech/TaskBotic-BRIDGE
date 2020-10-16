import { Request, Response } from "express";
import { connect } from "../database.mysql/database";
import { ParticipantBatchMap } from "../interface/taskbotic";
import { GoogleSpreadsheet } from "google-spreadsheet"
import { creds } from "../resources/credentials/credentials";
const otpGenerator = require('otp-generator') as any;

let doc = new GoogleSpreadsheet(
    "1J1U8awhcpyYrQg5z4Vx9uTu8Jn3-ycwZTGnZCpOPSMo"
);

export class TaskBoticService {
    constructor() { }

    async getParticipantsBatchMapping(req: Request, res: Response) {
        try {
            let db: any = req.headers.db;
            const conn = await connect(db);
            let selectQuery:any =`select * from participants_batch_map`
            const participants = await conn.query(selectQuery);
            res.status(200).json(
                participants[0]
            );
            return conn.end();
        }
        catch (err) {
            res.status(500).json({
                message: err
            })
        }
    }
    
    async getSpreadsheetData(req: Request, res: Response) {
        try{
            await doc.useServiceAccountAuth({
                client_email: creds.client_email,
                private_key: creds.private_key,
              });
              await doc.loadInfo(); // loads document properties and worksheets
              console.log(doc.title);
              const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
              const rows = await sheet.getRows({
                limit: 1000,
                offset: 0
              });
              let participants:any = []
              rows.forEach((element) => {
                let participant_id = ('PID' + otpGenerator.generate(8, { digits: true, alphabets: false, upperCase: false, specialChars: false }));
                let obj = {
                    participant_id: participant_id,
                    name: element["Drop your name here"],
                    email: element["Your email?"],
                    contact: element["Your Contact Number?"],
                    linkedin: element["Drop your Linkedin Profile (URL)"],
                    proficiency_MERN: element["Proficiency in MERN Stack?"],
                    currently_doing: element["What are you currently doing? "],
                    expectation: element["What are your expectation from the 100-days-of-code and why you want to join?"],
                    github: element["Github URL"] ||"Not Entered"
                }
                participants.push(obj)
              });
              res.status(200).json({
                participantData: participants
              });
              // return conn.end();
        }
        catch (err) {
            res.status(500).json({
                message: err
            })
        }
    }
}