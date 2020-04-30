import { Request, Response, NextFunction } from "express"
import passport from 'passport'

export const isAutenticated = (req: Request, res: Response, next: NextFunction) => {

  passport.authenticate("jwt", { session: false }, (error, user) => {

    if (error) return res.status(500).json({message: "Internal error"});
    if (!user) return res.status(403).json({message: "Unauthorized"});

    req.user = user;
    next();

  })(req, res, next);
};