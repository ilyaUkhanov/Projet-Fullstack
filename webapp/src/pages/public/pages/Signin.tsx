import * as React from 'react';
import {useState} from "react";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {Alert} from "@material-ui/core";
import {useAuth} from "../../../hooks/useAuth";
import {useHistory} from "react-router";
import Copyright from "../components/Copyright";
import {useSnackbar} from "notistack";
import {AxiosError} from "axios";
import {ErrorApi} from "../../../api/type";


const Signin = () => {
  const {signin} = useAuth()
  const {enqueueSnackbar} = useSnackbar()

  const useStyles = makeStyles((theme) => ({
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }));

  const classes = useStyles();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false)
  const [emailHelper, setEmailHelper] = useState('')

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false)
  const [passwordHelper, setPasswordHelper] = useState('')

  let [message, setMessage] = useState('');

  const history = useHistory()

  let handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    signin(email, password)
      .then(data => {
        enqueueSnackbar("Connexion réussie !", {
          variant: 'success'
        })
        history.push('/ucp')
      })
      .catch((error: AxiosError) => {
        enqueueSnackbar("Connexion impossible... Vérifiez vos identifiants et réessayez.", {
          variant: 'error'
        })

        setMessage("L'adresse email et/ou le mot de passe est incorrect. Vérifiez vos informations et réessayez.")
      })
  }

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          S'identifier
        </Typography>
        { message && <Alert severity="error" sx={{whiteSpace: 'pre-wrap'}}>{message}</Alert>}
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            error={emailError}
            helperText={emailHelper}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-mail"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={ e => setEmail(e.target.value)}
          />
          <TextField
            error={passwordError}
            helperText={passwordHelper}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mot de passe"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={ (e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Se souvenir de moi"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            S'identifier
          </Button>
          <Grid container>
            <Grid item>
              <Link href="/signup" variant="body2" color="inherit">
                {"Nouveau sur Acrobatt ? S’inscrire"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default Signin;