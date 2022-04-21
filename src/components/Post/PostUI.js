import React, { useRef, useState, useEffect, useCallback,useContext } from 'react'
import { signData } from '../../signData'
import styles from './Post.module.css'
import Web3Context from '../../web3Context'
const regex = new RegExp(
  /\b(\S+(?:png|jpe?g|gif|apng|avif|jfif|pjpeg|pjp|svg|webp|bmp|ico|cur|tif|tiff)\S*)\b/gim
)
// import { v4 as uuidv4 } from 'uuid'
export const PostUI = (props) => {
  const { post } = props
  const {currentProvider, recipiantContract, accounts} = useContext(Web3Context)
  const isInitialMount = useRef(true)
  const [finalImage, setFinalImage] = useState([])
  const [finalImagePreview, setFinalImagePreview] = useState([])
  const inputEl = useRef('')
  const [preview, setPreview] = useState(false)
  const checkForLink = useCallback((body, setter) => {
    let res = []
    if (body) res = body.match(regex)
    setter((_) => [])
    if (res) {
      const img = []
      res.forEach((regExpResult) => {
        doesImageExist(regExpResult).then((isImage) => {
          if (isImage) {
            fetch(regExpResult).then((res) => {
              res
                .blob()
                .then((blob) => {
                  const url = URL.createObjectURL(blob)
                  const image = new Image()
                  image.src = url
                  img.push(image)
                })
                .then((_) => {
                  setter((_) => [...img])
                })
            })
          }
        })
      })
    }
  }, [])

  const handleOnRespondClick = async (id, _e) => {
    const textBody = inputEl.current.value
    await signData(
      textBody,
      id,
      accounts[0],
      recipiantContract,
      currentProvider
    )
  }

  const doesImageExist = (url) =>
    new Promise((resolve) => {
      const img = new Image()
      img.src = url
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
    })
  const onPreview = () => {
    checkForLink(inputEl.current.value, setFinalImagePreview)
  }
  const checkboxChange = () => {
    setPreview(!preview)
  }
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      checkForLink(post.body, setFinalImage)
    } else {
      // console.log(finalImage)
      // console.log(preview)
      // Your useEffect code here to be run on update
    }
  }, [finalImage, checkForLink, post.body, preview])
  // const handleOnRespondRandomMsgClick = async (id, _e) => {
  //   const uuid = uuidv4()
  //   await signData(uuid, id, accounts[0], recipiantContract, currentProvider)
  // }
  return (
    <main className={styles.postUI_main_wrapper}>
      <div className={styles.postUI_container}>
        <div className={styles.inline_block}>
          <label>From :</label>
          <span> {post.sender}</span>
        </div>
        <div className={styles.inline_block}>
          <label>Id =</label> <span>{post.id}</span>
          <label> Prev = </label>
          <span> {post.prev}</span>
        </div>
        <div>
          <label>msg body:</label>
          <p> {post.body}</p>
          {finalImage.length > 0 ? (
            <div className={styles.post_img_wrapper}>
              {finalImage.map((res, index) => (
                <div key={index}>
                  <img src={res.src} alt="img" width="100px"></img>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {post.freePost ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <label> Commercial:</label>
            <img
              style={{
                color: 'red',
                fontWeight: 700,
                border: '1px solid black',
              }}
              src={post.uri}
              alt="commercial"
              height="100"
              width="200"
            />
          </div>
        ) : (
          <label> no commercial</label>
        )}
      </div>
      {/* <button
          type="button"
          onClick={(e) => handleOnRespondRandomMsgClick(post.id, e)}
        >
          random msg to id:{post.id}
        </button> */}
      <div
        style={{
          display: 'grid',
          marginBlock: '1em',
          gap: '1em',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1em',
          }}
        >
          <textarea
            className={styles.textArea}
            ref={inputEl}
            onChange={onPreview}
            placeholder="MESSAGE"
          />
          <div>
            <input
              type="checkbox"
              id="preview"
              name="preview"
              value={preview}
              onChange={checkboxChange}
            ></input>
            <label>Preview</label>
          </div>
        </div>
        <div style={{ display: 'grid' }}>
          <button
            className={styles.classy_class}
            type="button"
            onClick={(e) => handleOnRespondClick(post.id, e)}
          >
            Comment on ID: {post.id}
          </button>
        </div>
      </div>
      {preview && (
        <div style={{ gridColumn: '1 / span 2' }}>
          <label>preview comment on ID: {post.id}</label>
          <p> {inputEl.current.value}</p>
          {finalImagePreview.length > 0 ? (
            <div className={styles.post_img_wrapper}>
              {finalImagePreview.map((res, index) => (
                <div key={index} className={styles.post_img_wrapper}>
                  <div>
                    <img src={res.src} alt="img" width="100px"></img>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </main>
  )
}
