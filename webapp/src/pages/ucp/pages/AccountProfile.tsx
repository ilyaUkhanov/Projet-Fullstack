import * as React from 'react'
import {makeStyles, TypographyVariant} from "@material-ui/core/styles";
import {
  Avatar,
  Box,
  Button,
  Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Skeleton,
  Theme,
  Typography
} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import {ChangeEvent, useEffect, useState} from "react";
import {useAuth} from "../../../hooks/useAuth";
import {User} from "../../../api/type";
import useSelfAvatar from "../../../api/hooks/user/useSelfAvatar";
import useUpdateUser, {UpdateUser} from "../../../api/hooks/user/useUpdateUser";
import useUploadUserAvatar from "../../../api/hooks/user/useUploadAvatar";
import {useSnackbar} from "notistack";
import {isEmailValid, isEmpty} from "../../../utils/functions";
import useDeleteUserSelf from "../../../api/hooks/user/useDeleteUserSelf";
import {LoadingButton} from "@material-ui/lab";
import WarningIcon from '@material-ui/icons/Warning';
import {useRouter} from "../../../hooks/useRouter";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(4),
    display: 'flex',
    justifyContent: 'center',
  },
  formGroup: {
    border: '2px solid black',
  },
}))

export default function AccountProfile() {
  const classes = useStyles()

  const {enqueueSnackbar} = useSnackbar()

  const router = useRouter()

  const {user, signout, setUser, setUpdateCurrentUser} = useAuth()
  const updateUser = useUpdateUser()

  const [firstname, setFirstname] = useState('')
  const [firstnameError, setFirstnameError] = useState(false)
  const [firstnameHelper, setFirstnameHelper] = useState('')

  const [lastname, setLastname] = useState('')
  const [lastnameError, setLastnameError] = useState(false)
  const [lastnameHelper, setLastnameHelper] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [newPasswordError, setNewPasswordError] = useState(false)
  const [newPasswordHelper, setNewPasswordHelper] = useState('')

  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState(false)
  const [currentPasswordHelper, setCurrentPasswordHelper] = useState('')

  useEffect(() => {
    if (user) {
      setFirstname(user.firstName)
      setLastname(user.name)
    }
  }, [user])

  const handleUpdateProfile = () => {
    let formError = false
    setFirstnameError(false)
    setFirstnameHelper('')
    setLastnameError(false)
    setLastnameHelper('')
    setCurrentPasswordError(false)
    setCurrentPasswordHelper('')
    setNewPasswordError(false)
    setNewPasswordHelper('')

    let updateUserData: UpdateUser = {
      name: lastname,
      firstName: firstname,
      newPassword,
      newPasswordConfirmation: newPasswordConfirm,
      password: currentPassword,
    }

    if (isEmpty(currentPassword)) {
      formError = true
      setCurrentPasswordError(true)
      setCurrentPasswordHelper("Votre mot de passe est obligatoire pour modifier votre profil")
    }

    if (isEmpty(lastname)) {
      formError = true
      setLastnameError(true)
      setLastnameHelper("Ce champ est obligatoire.")
    }

    if (isEmpty(firstname)) {
      formError = true

      setFirstnameError(true)
      setFirstnameHelper("Ce champ est obligatoire.")
    }
    if (newPassword === '') {
      updateUserData = {
        name: lastname,
        firstName: firstname,
        password: currentPassword,
      }
    } else {
      if (newPassword !== newPasswordConfirm) {
        formError = true;
        setNewPasswordError(true)
        setNewPasswordHelper('Les mots de passes ne correspondent pas.')
      }
    }

    if (!formError) {
      updateUser.mutate(updateUserData, {
        onError(error) {
          console.log(error.response?.data)
          if (Array.isArray(error.response?.data.errors)) {
            error.response?.data.errors.forEach((error: { error: string }) => {
              if (error.error === "Mot de passe incorrect") {
                setCurrentPasswordError(true)
                setCurrentPasswordHelper("Votre mot de passe est incorrect.")
              }

              if (error.error === "Le nouveau mot de passe ne corresponds pas aux délimitations") {
                setNewPasswordError(true)
                setNewPasswordHelper("Votre mot de passe doit contenir au moins 8 caractères avec un nombre, une lettre minuscule et une lettre majuscule.")
              }
            })
          } else {
            const err = error.response?.data
            if (err?.error === "Mot de passe incorrect") {
              setCurrentPasswordError(true)
              setCurrentPasswordHelper("Votre mot de passe est incorrect.")
            }
          }
        },
        onSuccess(success) {
          setUpdateCurrentUser(true)
          enqueueSnackbar("Votre profil a été mis à jour", {variant: 'success'})
        }
      })
    }
  }

  const uploadAvatar = useUploadUserAvatar()

  const handleUploadAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      let file = e.target.files[0]
      let url = URL.createObjectURL(file)

      fetch(url)
        .then(res => res.blob())
        .then(blob => uploadAvatar.mutate({image: blob}, {
          onSuccess() {
            enqueueSnackbar("Photo de profil mise à jour !", { variant: 'success' })
          },
          onError() {
            enqueueSnackbar("Impossible de mettre à jour votre photo de profil suite à une erreur inconnu", { variant: 'error' })
          }
        }))
    }
  }

  const [deleteAccountOpenConfirmDialog, setDeleteAccountOpenConfirmDialog] = useState(false)

  const deleteUser = useDeleteUserSelf()
  const handleDeleteAccount = (value: boolean) => {
    setDeleteAccountOpenConfirmDialog(false)

    if (value) {
      setCurrentPasswordError(false)
      setCurrentPasswordHelper('')
      if (isEmpty(currentPassword)) {
        setCurrentPasswordError(true)
        setCurrentPasswordHelper("Votre mot de passe est obligatoire pour supprimer votre compte.");
      } else {
        deleteUser.mutate({password: currentPassword}, {
          onError(error) {
            console.log(error.response)

            if (error.response?.data.error.error === 'Mot de passe incorrect') {
              setCurrentPasswordError(true)
              setCurrentPasswordHelper("Votre mot de passe est incorrect.");
            }
          },
          onSuccess() {
            signout()
            router.push('/')
            enqueueSnackbar("Votre compte vient d'être supprimé. Cette action est irréversible.", {
              variant: 'warning',
            })
          }
        })
      }
    }
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="md">
        <form>
          <Grid container spacing={2} direction="column">
            <Grid item container pb={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="h5">
                  Avatar
                </Typography>
                <Typography variant="subtitle1">
                  Changer votre avatar ici
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                {user && <UserAvatar />}
                <input type="file" id="avatar" name="avatar" accept="image/jpeg" onChange={handleUploadAvatar}/>
              </Grid>
            </Grid>
            <Divider/>

            <Grid item container spacing={2} pb={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="h5">
                  Paramètres généraux
                </Typography>
                <Typography variant="subtitle1">
                  Cette section concerne les informations générales de votre profil utilisateur
                </Typography>
              </Grid>
              <Grid item xs={12} md={8} sm container direction="column" spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    disabled
                    helperText="Pour des raisons de sécurité, vous ne pouvez pas changer votre email. Merci de nous contacter."
                    variant="outlined"
                    required
                    type="email"
                    fullWidth
                    id="email"
                    label="E-mail"
                    name="email"
                    autoComplete="email"
                    value={user?.email}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    error={firstnameError}
                    helperText={firstnameHelper}
                    autoComplete="fname"
                    name="firstName"
                    variant="outlined"
                    fullWidth
                    id="firstName"
                    label="Prénom"
                    autoFocus
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    error={lastnameError}
                    helperText={lastnameHelper}
                    autoComplete="lname"
                    name="lastName"
                    variant="outlined"
                    fullWidth
                    id="lastName"
                    label="Nom"
                    autoFocus
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Divider/>

            <Grid item container pb={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="h5">
                  Changement de mot de passe
                </Typography>
                <Typography variant="subtitle1">
                  Laisser ces champs vide pour ne pas changer le mot de passe
                </Typography>
              </Grid>
              <Grid item xs={12} md={8} sm container direction="column" spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    error={newPasswordError}
                    helperText={newPasswordHelper}
                    variant="outlined"
                    required
                    fullWidth
                    name="new-password"
                    label="Mot de passe"
                    type="password"
                    id="new-password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="new-password-confirm"
                    label="Confirmation du mot de passe"
                    type="password"
                    id="new-password-confirm"
                    autoComplete="new-password-password"
                    value={newPasswordConfirm}
                    onChange={e => setNewPasswordConfirm(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Divider/>

            <Grid item container>
              <Grid item xs={12} md={4}>
                <Typography variant="h5">
                  Mot de passe actuel
                </Typography>
                <Typography variant="subtitle1">
                  Obligatoire pour modifier le profil
                </Typography>
              </Grid>
              <Grid item xs={12} md={8} sm container direction="column" spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    error={currentPasswordError}
                    helperText={currentPasswordHelper}
                    variant="outlined"
                    required
                    fullWidth
                    name="current-password"
                    label="Mot de passe"
                    type="password"
                    id="current-password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </Grid>
                <Grid item sx={{display: 'flex', justifyContent: 'space-between',}}>
                  <LoadingButton
                    loading={deleteUser.isLoading}
                    onClick={() => setDeleteAccountOpenConfirmDialog(true)}
                    variant="contained"
                    sx={{
                      backgroundColor: '#C80000',
                      borderColor: '#C80000',
                      '&:hover': {
                        backgroundColor: '#950000',
                        borderColor: '#950000',
                      },
                    }}
                  >
                    Supprimer mon compte
                  </LoadingButton>
                  <LoadingButton loading={updateUser.isLoading} variant="contained" onClick={handleUpdateProfile}>Mettre à jour mon profil</LoadingButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Container>
      <ConfirmDialog open={deleteAccountOpenConfirmDialog} onClose={handleDeleteAccount} />
    </div>
  )
}

const UserAvatar = () => {
  const avatar = useSelfAvatar()
  if (avatar.isSuccess && avatar.data) {
    return (
      <Avatar
        src={avatar.data}
        sx={{width: 66, height: 66}}
      />
    )
  }

  if (avatar.isLoading) {
    return <Skeleton variant="circular" width={66} height={66}/>
  }

  return (
    <Avatar
      sx={{width: 66, height: 66}}
    />
  )
}

interface ConfirmDialogProps {
  open: boolean
  onClose: (value: boolean) => void
}

function ConfirmDialog(props: ConfirmDialogProps) {
  const {onClose, open,} = props;

  return (
    <Dialog
      open={open}
      maxWidth="xs"
    >
      <DialogTitle>Etes-vous sûr de vouloir supprimer votre compte ?</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          <strong>ATTENTION :</strong> vous êtes sur le point de supprimer votre compte, cette action est irréversible.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={() => onClose(false)}>
          Annuler
        </Button>
        <Button autoFocus onClick={() => onClose(true)}>
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  )
}