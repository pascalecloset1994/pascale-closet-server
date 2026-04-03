export class LogsController {
   constructor({ db }) {
      this.db = db;
   }

   createLog = async (req, res) => {
      try {
         const { log } = req.body;
         await this.db.query("INSERT INTO logger_pascale (message) VALUES ($1)", [log]);
         res.status(200).send();
      } catch (error) {
         res.status(500).json({ message: "No se ha podido conectar al servidor." });
      }
   }
}
