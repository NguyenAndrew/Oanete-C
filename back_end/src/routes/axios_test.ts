import { Request, Response } from "express";

module.exports = {
  post: (req: Request, res: Response) => {
    console.log("You have succesfully made an axios call!");
    res.status(200).send("axios-test completed succesfully!");
  },
};
