import express from "express"
import { router as LoginRouter } from './login'
import { signup } from './signup'
import { CustomError } from "../../errors";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Login and Signup control
 */

/**
 * @swagger
 * path:
 *  /login/:
 *    post:
 *      tags: [Auth]
 *      description: Log in
 *      parameters:
 *        - name: body
 *          in: body
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *              password:
 *                type: string
 *                format: password
 *            required:
 *              - email
 *              - password
 *      responses:
 *        '200': 
 *          description: Succesful
 *          schema:
 *            type: object
 *            properties:
 *              token:
 *                type: string
 *              user:
 *                $ref: '#/definitions/User'
 *                type: User
 *        '500': 
 *          description: Internal server error | User not found | Invalid Password
 *  /signup/:
 *    post:
 *      tags: [Auth]
 *      description: Signup
 *      parameters:
 *        - name: body
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#definitions/User'
 *            type: object
 *            required:
 *              - email
 *              - name
 *              - lastName
 *              - password
 *      responses:
 *        '200': 
 *          description: Succesful
 *          schema:
 *            $ref: '#/definitions/User'
 *            type: User
 *        '403':
 *          description: Email is already taken
 *        '500': 
 *          description: Internal server error
 */

router.use("/login", LoginRouter)
router.post("/signup", async (req, res) => {
  try {

    const user = await signup(req.body)

    res.json(user)
  } catch(e) {
    console.log(e.stack)

    if(e instanceof CustomError) {
      res.status(e.code).json({error: e.clientMessage})
    } else {
      res.status(500).json({error: 'Internal server error'})
    }
  }
})

export { router }