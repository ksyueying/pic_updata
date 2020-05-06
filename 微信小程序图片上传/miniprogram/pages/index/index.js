//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {
    var that = this
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        that.setData({
          openid_info: res.result.openid
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
     
      }
    })
  },

  // 上传图片
  getdata() {
    let that = this;
    wx.chooseImage({    //这一段是上传图片
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        });
        let filePath = res.tempFilePaths[0];
        wx.cloud.uploadFile({     //这一段是上传到云数据中的
          cloudPath: 'mibao1d.jpg',
          filePath: filePath,    //这个就是图片的存储路径
          success: res => {
            console.log('[上传图片]成功:', res)
            that.setData({
              bigImg: res.fileID,
            });
            let fileID = res.fileID;
            let open_info = that.data.openid_info  
            console.log(that.data.bigImg)
            console.log(that.data.openid_info)
            wx.getImageInfo({
              src: that.data.bigImg,
              success: function (res) {
                console.log('happening:', res.path) //这个是转换的临时链接res.path
                that.setData({
                  tempath:res.path
                })
                console.log('tempath',that.data.tempath)
                let tempinfo = that.data.tempath
                db.collection('newdata').add({    //这个就把云数据的图片存储路径上传到数据链表中了
                  data: {
                    imginfo: fileID,
                    respath: tempinfo
                  },
                  success(res) {
                    console.log('get success')
                    console.log(res)
                    console.log(tempinfo)
                  }
                })
              },
              fail: function (res) {
                console.log('failure')
              }
            })
            
            const db = wx.cloud.database();
            
          },
          fail: e => {
            console.error('[上传图片]失败：', e)
          },
          complete: () => {
            wx.hideLoading()
          }
        });
      }
    })
  }
})
