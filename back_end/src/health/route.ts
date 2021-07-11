import { Request, Response } from "express";

module.exports = {
  get: (req: Request, res: Response) => {
    res.status(200).send("Healthy!");
  },
};
