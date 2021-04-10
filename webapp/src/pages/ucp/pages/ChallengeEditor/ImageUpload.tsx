import * as React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {Box} from "@material-ui/core";
import Dropzone from "react-dropzone";
import {useCallback} from "react";
import useUploadChallengeImage from "../../../../api/useUploadChallengeImage";
import {useRouter} from "../../../../hooks/useRouter";
import {useQueryClient } from 'react-query'


const useStyles = makeStyles({
  root: {
    height: 'calc(100vh - 150px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropZoneContainer: {
    height: '100%',

  },
  dropZoneChild: {
    height: '100%',
    display: 'flex',
    alignItems: 'center'
  }
})


type Props = {
  onImageUpload: () => void
}

const ChallengeEditor = (props: Props) => {
  const classes = useStyles();

  const router = useRouter();
  // @ts-ignore
  let {id} = router.query;

  const mutation = useUploadChallengeImage()
  const queryClient = useQueryClient()


  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) {
      let file = acceptedFiles[0];
      let url = URL.createObjectURL(file);

      fetch(url)
        .then(res => res.blob())
        .then(blob => mutation.mutate({id: id, image: blob},
          {
            onSuccess: () => {
              console.log("success upload")
              props.onImageUpload()
              queryClient.invalidateQueries(['challengeImage'])
            },
            onError: (error) => {
              console.error(error)
            }
          }))

      /*let image = new Image();
      image.src = url;
      image.onload = () => {
        const bitmap = createImageBitmap(image)
        Promise.resolve(bitmap).then(res => {
          mutation.mutate({id: 1, image: res}, {
            onSuccess: () => {
              console.log("upload successful")
            },
            onError: (error) => {
              console.error(error)
            }
          })
        });
      }*/
    }

  }, [])


  return (
    <div className={classes.root}>
      <Box
        sx={{
          m: 2,
          border: '1px solid black',
          height: 150,
        }}
      >
        <Dropzone
          onDrop={onDrop}
          accept="image/*"
        >
          {({getRootProps, getInputProps}) => (
            <section className={classes.dropZoneContainer}>
              <div {...getRootProps()} className={classes.dropZoneChild}>
                <input {...getInputProps()}/>
                <div>Drag 'n' drop some files here, or click to select files</div>
              </div>
            </section>
          )}
        </Dropzone>
      </Box>
    </div>
  )
}

export default ChallengeEditor