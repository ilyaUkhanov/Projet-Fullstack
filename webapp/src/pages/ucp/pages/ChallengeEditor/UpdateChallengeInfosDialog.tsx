import {
  Alert,
  AlertProps,
  AlertTitle, Avatar,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider, Fab,
  Grid,
  IconButton,
  InputAdornment, List, ListItem, ListItemAvatar, ListItemText,
  OutlinedInput,
  Paper,
  Tab,
  Table, TableBody,
  TableCell,
  TableContainer, TableFooter,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Theme,
  Typography,
  useTheme
} from "@material-ui/core";
import * as React from "react";
import {SetStateAction, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import useUpdateChallenge from "../../../../api/useUpdateChallenge";
import {useRouter} from "../../../../hooks/useRouter";
import {Editor} from '@tinymce/tinymce-react'
import {Challenge} from "../../../../api/entities/Challenge";
import usePublishChallenge from "../../../../api/usePublishChallenge";
import CloseIcon from '@material-ui/icons/Close';
import useUser from "../../../../api/useUser";
import AddIcon from '@material-ui/icons/Add';
import useSelfAvatar from "../../../../api/useSelfAvatar";
import Dropzone from "react-dropzone";
import {useQueryClient} from "react-query";
import useUploadChallengeImage from "../../../../api/useUploadChallengeImage";
import {useSnackbar} from "notistack";

const useStyles = makeStyles((theme: Theme) => ({}))

type Props = {
  open: boolean
  setOpen: (value: SetStateAction<boolean>) => void
  challenge: Challenge
}

const UpdateChallengeInfosDialog = (props: Props) => {
  const classes = useStyles()
  const theme = useTheme()
  const {
    open,
    setOpen
  } = props;

  const router = useRouter()
  let id = parseInt(router.query.id)

  const updateChallenge = useUpdateChallenge()
  const publishChallenge = usePublishChallenge()

  const [challenge, setChallenge] = useState(props.challenge)
  const [name, setName] = useState(challenge.attributes.name)
  const [scale, setScale] = useState(challenge.attributes.scale)
  const [shortDescription, setShortDescription] = useState(challenge.attributes.shortDescription)
  const richTextDescriptionEditorRef = useRef(null)
  const [dirty, setDirty] = useState(false)
  useEffect(() => setDirty(false), [challenge.attributes.description])

  const {enqueueSnackbar} = useSnackbar()

  const [openAlertPublish, setOpenAlertPublish] = useState<boolean>(false)
  const [publishAlertMsg, setPublishAlertMsg] = useState<JSX.Element>(<></>)
  const [publishAlertSeverity, setPublishAlertSeverity] = useState<AlertProps['severity']>("success")

  const handleClose = (e: object, reason: string) => {
    if (reason === "escapeKeyDown" || reason === "backdropClick") return
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false);
  }

  const handleUpdateChallenge = () => {
    if (richTextDescriptionEditorRef.current) {
      //@ts-ignore
      const content = richTextDescriptionEditorRef.current.getContent()
      setDirty(false)
      //@ts-ignore
      richTextDescriptionEditorRef.current.setDirty(false)

      updateChallenge.mutate({
        id: id,
        scale: scale,
        name: name,
        description: content,
        shortDescription: shortDescription,
      }, {
        onSuccess() {
          enqueueSnackbar("Paramètres sauvegardés", {
            variant: 'success',
          })
        }
      })
    }
  }

  const handleUnpublishedClick = () => {

  }

  const handlePublishClick = () => {
    publishChallenge.mutate(challenge.id!, {
      onError(error) {
        setOpenAlertPublish(true)
        setPublishAlertSeverity("warning")
        setPublishAlertMsg(
          <div>
            <AlertTitle>Impossible de publier le challenge</AlertTitle>
            Vous ne pouvez pas publier le challenge en l'état.
            <ul>
              <li>Vérifier si il y a un checkpoint de début et de fin</li>
              <li>Vérifier qu'il n'y ai pas de cul de sac</li>
            </ul>
          </div>
        )
      },
      onSuccess(challenge) {
        setChallenge(challenge)
        setOpenAlertPublish(true)
        setPublishAlertSeverity("success")
        setPublishAlertMsg(
          <div>
            <AlertTitle>Le challenge vient d'être publié</AlertTitle>
            Les utilisateurs peuvent maintenant trouver votre challenge et s'y inscrire.
          </div>
        )
      }
    })
  }

  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }

  const [openSuperAdminList, setOpenSuperAdminList] = useState(false)

  const handleAddAdmin = () => {
    setOpenSuperAdminList(true)
  }

  const handleClickOnSuperAdmin = (id: number) => {
    console.log(id)
    setOpenSuperAdminList(false)
  }

  const mutation = useUploadChallengeImage()
  const queryClient = useQueryClient()

  const [backgroundChangeState, setBackgroundChangeState] = useState<'ERROR' | 'SUCCESS' | null>(null)

  const onDrop = useCallback((acceptedFiles) => {
    console.log("why")

    if (acceptedFiles[0]) {
      let file = acceptedFiles[0];
      let url = URL.createObjectURL(file);

      fetch(url)
      .then(res => res.blob())
      .then(blob => mutation.mutate({id: challenge.id!, image: blob},
        {
          onSuccess: () => {
            queryClient.invalidateQueries(['challengeImage'])
            setBackgroundChangeState('SUCCESS')
          },
          onError: (error) => {
            console.error(error)
          }
        })
      )
    }
  }, [])

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Informations du challenge</DialogTitle>
      <Divider/>
      <DialogContent sx={{
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
      }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          sx={{borderRight: theme => `1px solid ${theme.palette.divider}`,}}
        >
          <Tab label="Informations générales" {...a11yProps(0)} />
          <Tab label="Administrateurs" {...a11yProps(1)} />
          <Tab label="Background" {...a11yProps(1)} />
          <Tab label="Publication" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <DialogContentText>
            Merci d'indiquer le nom et la description du challenge.
          </DialogContentText>
          <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  autoFocus
                  margin="dense"
                  id="challenge-name"
                  label="Nom du challenge"
                  fullWidth
                  sx={{marginBottom: 2}}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  required
                  autoFocus
                  margin="dense"
                  id="challenge-scale"
                  label="Échelle de la carte (en m)"
                  helperText="L'échelle correspond à la longueur du plus grand côté de la carte"
                  fullWidth
                  sx={{marginBottom: 2}}
                  value={scale}
                  inputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
                  onChange={e => {
                    //@ts-ignore
                    setScale(e.target.value)
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              required
              id="challenge-short-description"
              label="Description courte"
              inputProps={{
                maxLength: "255"
              }}
              helperText="255 caractères maximum"
              multiline
              rows={4}
              fullWidth
              sx={{marginBottom: 2}}
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
            />
            <Editor
              //@ts-ignore
              onInit={(evt, editor) => richTextDescriptionEditorRef.current = editor}
              onDirty={() => setDirty(true)}
              apiKey="6pl0iz9g4ca009y51jg1ffvalfrjjh681qs96iqoj86ynoyp"
              initialValue={challenge.attributes.description}
              init={{
                height: 250,
                skin: theme.palette.mode == 'dark' ? 'oxide-dark' : 'oxide',
                content_css: theme.palette.mode == 'dark' ? 'dark' : 'default',
                menubar: false,
                plugins: [
                  'advlist autolink lists link image charmap print preview anchor',
                  'searchreplace visualblocks code fullscreen',
                  'insertdatetime media table paste code help wordcount'
                ],
                toolbar: [
                  'undo redo | formatselect | bold italic backcolor | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help'
                ]
              }}
            />
            <Button
              variant="contained"
              sx={{mt: 2, alignSelf: 'flex-end'}}
              onClick={handleUpdateChallenge}
            >
              Sauvegarder
            </Button>

          </Box>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Prénom</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell/>
                </TableRow>
              </TableHead>
              <TableBody>
                {challenge.attributes.administratorsId.map(adminId => (
                  <ChallengeAdminRow key={adminId} administratorId={adminId}/>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Fab
            color="primary"
            size="small"
            aria-label="add"
            sx={{
              position: 'absolute',
              bottom: 65,
              right: 16,
            }}
            onClick={handleAddAdmin}
          >
            <AddIcon/>
          </Fab>
        </TabPanel>

        <TabPanel value={value} index={2}>
            <Collapse in={backgroundChangeState === 'SUCCESS'}>
            <Alert
              variant="filled"
              severity="success"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setBackgroundChangeState(null)}
                >
                  <CloseIcon fontSize="inherit"/>
                </IconButton>
              }
            >
              <AlertTitle>Background modifié avec succès</AlertTitle>
              <strong>ATTENTION</strong>: Vous devez rafraichir la page pour voir les changements.
            </Alert>
          </Collapse>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                m: 2,
                border: '1px solid black',
                height: 150,
              }}
            >
              <Dropzone
                onDrop={onDrop}
                accept="image/jpeg"
              >
                {({getRootProps, getInputProps}) => (
                  <Box component="section" sx={{height: '100%'}}>
                    <Box
                      {...getRootProps()}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <input {...getInputProps()}/>
                      <Box sx={{padding: theme => theme.spacing(1)}}>Déposer une image ici pour l'utiliser comme background</Box>
                    </Box>
                  </Box>
                )}
              </Dropzone>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={value} index={3}>
          <Typography variant="subtitle1">
            Publication du challenge
          </Typography>
          <Collapse in={openAlertPublish}>
            <Alert
              severity={publishAlertSeverity}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setOpenAlertPublish(false)}
                >
                  <CloseIcon fontSize="inherit"/>
                </IconButton>
              }
              sx={{mb: 2}}
            >
              {publishAlertMsg}
            </Alert>
          </Collapse>
          {!challenge.attributes.published && <Button variant="contained" onClick={handlePublishClick}>Publier</Button>}
        </TabPanel>
      </DialogContent>
      <Divider/>
      <DialogActions>
        <Button onClick={handleCancel}>Fermer</Button>
      </DialogActions>

      <Dialog open={openSuperAdminList} onClose={() => setOpenSuperAdminList(false)}>
        <List dense sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper'}}>
          {[1, 2].map(superAdminId => {
            if (!challenge.attributes.administratorsId.includes(superAdminId)) {
              return (
                <SuperAdminListItem key={superAdminId} superAdminId={superAdminId}
                                    onClick={() => handleClickOnSuperAdmin(superAdminId)}/>
              )
            }
          })}
        </List>
      </Dialog>
    </Dialog>
  )
}

export default UpdateChallengeInfosDialog

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const {children, value, index, ...other} = props;

  return (
    <div
      style={{margin: '0 auto'}}
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{p: 3}}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

interface ChallengeAdminRowProps {
  administratorId: number
}

function ChallengeAdminRow(props: ChallengeAdminRowProps) {
  const {
    administratorId,
  } = props

  const admin = useUser(administratorId)

  return (
    <>
      {admin.isLoading && (
        <TableRow>
          <TableCell colSpan={3}>Chargement...</TableCell>
        </TableRow>
      )}

      {admin.isError && (
        <TableRow>
          <TableCell colSpan={3}>Une erreur est survenue</TableCell>
        </TableRow>
      )}

      {admin.isSuccess && (
        <TableRow>
          <TableCell>{admin.data.firstName}</TableCell>
          <TableCell>{admin.data.name}</TableCell>
          <TableCell>{admin.data.email}</TableCell>
        </TableRow>
      )}
    </>
  )
}

interface SuperAdminListItemProps {
  superAdminId: number
  onClick: () => void
}

function SuperAdminListItem(props: SuperAdminListItemProps) {
  const {
    superAdminId,
    onClick,
  } = props

  const superAdmin = useUser(superAdminId)

  return (
    superAdmin.isSuccess ? (
      <>
        <ListItem button onClick={onClick}>
          <ListItemAvatar>
            <Avatar alt={superAdmin.data.firstName + ' ' + superAdmin.data.name} src=""/>
          </ListItemAvatar>
          <ListItemText>{superAdmin.data.firstName} {superAdmin.data.name}</ListItemText>
        </ListItem>
        <Divider variant="inset" component="li"/>
      </>
    ) : null
  )
}