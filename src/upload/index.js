import axios from 'axios'

const Upload = () => {
  let count = 0; // 记录需要上传的文件下标
  const handleVideo = async (event, name, url) => {
    // 阻止浏览器默认表单事件
    event.preventDefault();
    let currentSize = document.querySelector("h2");
    let files = document.querySelector(name).files;
    // 默认切片数量
    const sectionLength = 5;
    // 首先请求接口，获取服务器是否存在此文件
    // count为0则是第一次上传，count不为0则服务器存在此文件，返回已上传的切片数
    count = await handleCancel(files[0]);

    // 申明存放切片的数组对象
    let fileCurrent = [];
    // 循环file文件对象
    for (const file of [...files]) {
      // 得出每个切片的大小
      let itemSize = Math.ceil(file.size / sectionLength);
      // 循环文件size，文件blob存入数组
      let current = 0;
      for (current; current < file.size; current += itemSize) {
        fileCurrent.push({ file: file.slice(current, current + itemSize) });
      }
      // axios模拟手动取消请求
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      // 当断点续传时，处理切片数量，已上传切片则不需要再次请求上传
      fileCurrent =
        count === 0 ? fileCurrent : fileCurrent.slice(count, sectionLength);
      // 循环切片请求接口
      for (const [index, item] of fileCurrent.entries()) {
        // 模拟请求暂停 || 网络断开
        if (index > 90) {
          source.cancel("取消请求");
        }
        // 存入文件相关信息
        // file为切片blob对象
        // filename为文件名
        // index为当前切片数
        // total为总切片数
        let formData = new FormData();
        formData.append("file", item.file);
        formData.append("filename", file.name);
        formData.append("total", sectionLength);
        formData.append("index", index + count + 1);

        await axios({
          url: `http://10.8.0.102:8080/${url}`,
          method: "POST",
          data: formData,
          cancelToken: source.token,
        })
          .then((response) => {
            // 返回数据显示进度
            currentSize.innerHTML = `进度${response.data.size}%`;
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  };

  // 请求接口，查询上传文件是否存在
  // count为0表示不存在，count不为0则已上传对应切片数
  const handleCancel = (file) => {
    return axios({
      method: "post",
      url: "http://10.8.0.102/getSize",
      headers: { "Content-Type": "application/json; charset = utf-8" },
      data: {
        fileName: file.name,
      },
    })
      .then((res) => {
        return res.data.count;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleTest = () => {
    return axios({
        method: "get",
        url: "http://localhost:8080/test",
      })
        .then((res) => {
          console.log(res,'res');
        })
        .catch((err) => {
          console.log(err);
        });
  }
  return (
    <>
      <input className='video' type="file" />
      <button type="submit" onClick={(event) => (handleVideo(event, '.video', 'video'))}>
        提交
      </button>
      <div onClick={handleTest}>
        点击一下
      </div>
    </>
  );
};
export default Upload;
