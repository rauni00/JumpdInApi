import firebase from 'firebase/compat/app'; //v9
import 'firebase/compat/auth'; //v9
import 'firebase/compat/firestore'; //v9
import express from 'express';
const app = express();
import config from './serviceAccountKey.json' assert { type: 'json' };
import bodyParser from 'body-parser';
import validateProfileInput from './validator/setProfile.cjs';
import validatePostInput from './validator/createPost.cjs';
// import { getAuth } from 'firebase/compat/auth';
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//! firebase connection
try {
	firebase.initializeApp(config);
	console.log('Firebase Database Connected Success');
} catch (error) {
	console.log('===============', error);
}
//! database connection
const db = firebase.firestore();
const auth = firebase.auth();

app.get('/', (req, res) => {
	res.send('<h1>HELLO</h1>');
});
//! auth with firebase auth
app.post('/register', (req, res) => {
	if (!req.body.email) {
		return res.status(400).json({ email: 'email is require' });
	} else {
		if (!req.body.password) {
			return res.status(400).json({ password: 'password is require' });
		}
	}
	auth.createUserWithEmailAndPassword(req.body.email, req.body.password)
		.then((newUser) => {
			res.status(200).json({ msg: newUser });
		})
		.catch((err) => {
			res.json(err.message);
		});
});

//!  register with google auth
app.post('/google/register', (req, res) => {
	const provider = new firebase.auth.GithubAuthProvider();
	auth.fetchSignInMethodsForEmail(provider)
		.then((signIn) => {
			const token = auth?.currentUser?.getIdToken(true);
			if (token) {
				res.json(token); //5 - put the token at localStorage (We'll use this to make requests)
				// localStorage.setItem('@token', token);
				//6 - navigate user to the book list
				// history.push('/book-list');
			}
		})
		.catch((err) => {
			res.json(err);
		});
	// google()
	// auth.signInWithPopup;
	// let googleAuth = getAuth;
	// res.json(googleAuth);
	// const provider = firebase.auth.GoogleAuthProvider;
	// auth.signInWithPopup(provider);
});

//! login user
app.post('/login', (req, res) => {
	if (!req.body.email) {
		return res.status(400).json({ email: 'email is require' });
	} else {
		if (!req.body.password) {
			return res.status(400).json({ password: 'password is require' });
		}
	}
	auth.signInWithEmailAndPassword(req.body.email, req.body.password)
		.then((register) => {
			res.json(register);
		})
		.catch((error) => {
			if (error.code == 'auth/wrong-password') {
				res.status(400).json({ password: 'wrong-password' });
			} else {
				if (error.code == 'auth/user-not-found') {
					res.status(400).json({ User: 'User not Found' });
				}
			}
		});
});

// !Forget Password
app.post('/forget', (req, res) => {
	if (!req.body.email) {
		return res.status(400).json({ email: 'email is require' });
	}
	auth.sendPasswordResetEmail(req.body.email)
		.then((send) => {
			res.json('Password reset email link sent');
		})
		.catch((error) => {
			res.json(error.code);
		});
});

// !User Profile
app.post('/setProfile', (req, res) => {
	const { errors, isValid } = validateProfileInput(req.body);
	if (!isValid) {
		return res.status(400).json(errors);
	} else {
		auth.onAuthStateChanged((user) => {
			const fields = {
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: user.email,
				Mobile: req.body.Mobile,
			};

			db.collection('users')
				.doc(req.headers['uid'])
				.set(fields)
				.then((user) => {
					res.json(user);
				})
				.catch((err) => {
					res.json(err);
				});
		});
	}
});

// ! Get User Profile
app.get('/profile', (req, res) => {
	db.collection('users')
		.doc(req.headers['uid'])
		.get()
		.then((user) => {
			let userDetails = {};
			userDetails = user.data();
			userDetails['id'] = user.id;
			res.json(userDetails);
		})
		.catch((err) => {
			res.json(err);
		});
});

// ! verify account by otp
// app.post('/verify', (req, res) => {
// 	db.collection('users')
// 		.doc(req.headers['uid'])
// 		.get()
// 		.then((user) => {
// 			const value = auth.signInWithPhoneNumber(user.data().Mobile).then((otp) => {
// 				// res.json(otp);
// 			});
// 			res.json(value);
// 		});
// 	// auth.currentUser.phoneNumber;
// });
//! Create post
app.post('/createPost', (req, res) => {
	const { errors, isValid } = validatePostInput(req.body);
	if (!isValid) {
		return res.status(400).json(errors);
	}
	const postFields = {
		title: req.body.title,
		caption: req.body.caption,
		image: req.body.image,
		time: new Date(),
		userId: req.headers['uid'],
		comments: [],
		likes: [],
	};
	db.collection('posts')
		.doc()
		.set(postFields)
		.then((post) => {
			res.json(post);
		})
		.catch((error) => {
			res.json(error);
		});
});
// ! Get Post of user
app.get('/getPost', (req, res) => {
	db.collection('posts')
		.where('userId', '==', req.headers['uid'])
		.get()
		.then((post) => {
			let temp = [];
			post.forEach((documentSnapshot) => {
				let userDetails = {};
				userDetails = documentSnapshot.data();
				userDetails['id'] = documentSnapshot.id;
				temp.push(userDetails);
			});
			res.json(temp);
		})
		.catch((error) => {
			res.json(error);
		});
});

//! Create Comments
app.post('/createComment', (req, res) => {
	if (!req.body.comment) {
		return res.status(400).json({ comment: 'comment is require' });
	} else {
		const commentFields = {
			PostId: req.body.PostId,
			userId: req.headers['uid'],
			comment: req.body.comment,
			time: new Date(),
		};
		db.collection('posts')
			.doc(req.body.PostId)
			.update({
				comments: firebase.firestore.FieldValue.arrayUnion(commentFields),
			})
			.then((post) => {
				res.json(post);
			})
			.catch((error) => {
				res.json(error);
			});
	}
});

// ! likes
app.post('/like', (req, res) => {
	const likes = {
		PostId: req.body.PostId,
		userId: req.headers['uid'],
		// like: req.body.like,
		like: true,
	};
	db.collection('posts')
		.doc(req.body.PostId)
		.update({ likes: firebase.firestore.FieldValue.arrayUnion(likes) })
		.then((like) => {
			res.json(like);
		})
		.catch((error) => {
			res.json(error);
		});
});
// ! Un-likes
app.post('/Unlike', (req, res) => {
	const likes = {
		PostId: req.body.PostId,
		userId: req.headers['uid'],
		like: false,
	};
	db.collection('posts')
		.doc(req.body.PostId)
		.update({ likes: firebase.firestore.FieldValue.arrayRemove(likes) })
		.then((like) => {
			res.json(like);
		})
		.catch((error) => {
			res.json(error);
		});
});

app.listen(port, () => console.log(`Server is listen at ${port}`));
