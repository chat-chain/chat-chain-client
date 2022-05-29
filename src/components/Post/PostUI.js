import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from 'react'

import { signData } from 'signData'
import styles from './Post.module.css'
import Web3Context from 'web3Context'
import PlaySvg from 'assets/play.svg'
const regex = new RegExp(
  /\b(\S+(?:png|jpe?g|gif|apng|avif|jfif|pjpeg|pjp|svg|webp|bmp|ico|cur|tif|tiff)\S*)\b/gim
)
// import { v4 as uuidv4 } from 'uuid'
export const PostUI = (props) => {
  const { post } = props
  const { currentProvider, recipiantContract, eveeContract, accounts } =
    useContext(Web3Context)
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
      eveeContract,
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
    <main>
      <div className={styles.postUI_container_bigger}>
        <div>
          <label>Id =</label> <span>{post.id}</span>
          <label> Prev = </label>
          <span> {post.prev}</span>
        </div>
        {post.freePost ? (
          <div
            style={{
              display: 'flex',
              backgroundColor: '#C4C4C4',
              borderRadius: '15px',
              padding: '6px',
              maxWidth: '400px',
            }}
          >
            <img
              style={{
                color: 'red',
                fontWeight: 700,
                backgroundColor: '#C4C4C4',
                borderRadius: '15px',
              }}
              src={post.uri}
              alt="commercial"
            />
          </div>
        ) : (
          <label> no commercial</label>
        )}
        <p>{post.timestamp.toLocaleString()}</p>
        <p className={styles.account_profile}> {post.sender}</p>
        <div>
          <p className={styles.body_text}> {post.body}</p>
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
      </div>
      <div className={styles.comment_section}>
        <textarea
          className={styles.textArea}
          ref={inputEl}
          onChange={onPreview}
          placeholder="Write a comment..."
        />
        <div>
          <button
            className={styles.play_elipse}
            type="button"
            onClick={(e) => handleOnRespondClick(post.id, e)}
          >
            {/* Comment on ID: {post.id} */}
            <img src={PlaySvg} alt="play" />
          </button>
        </div>
      </div>
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
