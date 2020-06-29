import express from 'express'
import { findAllUsers } from './controller';
import { CustomError } from '../../errors';

const router = express.Router()
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/**
 * @swagger
 *  /user/:
 *    get:
 *      tags: [User]
 *      description: Gets list of all users
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        '200': 
 *          description: Succesful
 *          schema:
 *            type: array
 *            items:
 *              type: User
 *              $ref: '#/definitions/User'
 *        '403':
 *          description: No bearer token provided in request header
 *        '500': 
 *          description: Internal server error
 */

router.get("/", async (req, res) => {

  try{
    const users = await findAllUsers()

    res.status(200).json(users)
  } catch(e) {
    console.log(e.stack)

    if(e instanceof CustomError) {
      res.status(e.code).json({error: e.clientMessage})
    } else {
      res.status(500).json({error: 'Internal server error'})
    }
  }

});

export { router }