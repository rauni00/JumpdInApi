import firebase from 'firebase/compat/app'; //v9
import 'firebase/compat/auth'; //v9
import 'firebase/compat/firestore'; //v9
import express from 'express';
const router = express.Router();
const auth = firebase.auth();

router.post('/register', (req, res) => {
	auth.createUserWithEmailAndPassword(req.body.email, req.body.password)
		.then((newUser) => {
			res.status(200).json({ msg: 'success' });
		})
		.catch((err) => {
			res.json(err.message);
		});
});
export default router;
