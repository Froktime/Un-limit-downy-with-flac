// ==UserScript==
// @name         Unlimited_downloader (flac)
// @name:zh-CN   无限制下载器
// @namespace    ooooooooo.io
// @version      0.1.9
// @description  Get video and audio binary streams directly, breaking all download limitations. (As long as you can play, then you can download!)
// @description:zh-Cn  直接获取视频和音频二进制流，打破所有下载限制。（只要你可以播放，你就可以下载！）
// @author       dabaisuv
// @match        *://*/*
// @exclude      https://mail.qq.com/*
// @exclude      https://wx.mail.qq.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
   'use strict';
   console.log(`Unlimited_downloader: begin......${location.href}`);

   //Setting it to 1 will automatically download the video after it finishes playing.
   window.autoDownload = 1;

   window.isComplete = 0;
   window.audio = [];
   window.video = [];
   window.downloadAll = 0;
   window.quickPlay = 1.0;

   const _endOfStream = window.MediaSource.prototype.endOfStream
   window.MediaSource.prototype.endOfStream = function () {
      window.isComplete = 1;
      return _endOfStream.apply(this, arguments)
   }
   window.MediaSource.prototype.endOfStream.toString = function() {
       console.log('endOfStream hook is detecting!');
      return _endOfStream.toString();
   }

   const _addSourceBuffer = window.MediaSource.prototype.addSourceBuffer
   window.MediaSource.prototype.addSourceBuffer = function (mime) {
      console.log("MediaSource.addSourceBuffer ", mime)
      if (mime.toString().indexOf('audio') !== -1) {
         window.audio = [];
         console.log('audio array cleared.');
      } else if (mime.toString().indexOf('video') !== -1) {
         window.video = [];
         console.log('video array cleared.');
      }
      let sourceBuffer = _addSourceBuffer.call(this, mime)
      const _append = sourceBuffer.appendBuffer
      sourceBuffer.appendBuffer = function (buffer) {
         console.log(mime, buffer);
         if (mime.toString().indexOf('audio') !== -1) {
            window.audio.push(buffer);
         } else if (mime.toString().indexOf('video') !== -1) {
            window.video.push(buffer)
         }
         _append.call(this, buffer)
      }

      sourceBuffer.appendBuffer.toString = function () {
         console.log('appendSourceBuffer hook is detecting!');
         return _append.toString();
      }
      return sourceBuffer
   }

   window.MediaSource.prototype.addSourceBuffer.toString = function () {
      console.log('addSourceBuffer hook is detecting!');
      return _addSourceBuffer.toString();
   }

   function download() {
      let a = document.createElement('a');
      // Change audio download to FLAC
      a.href = window.URL.createObjectURL(new Blob(window.audio, { type: 'audio/flac' }));
      a.download = 'audio_' + document.title + '.flac';  // Đặt tên file là .flac
      a.click();

      // Download video in mp4 format, only when video has finished downloading
      if (window.isComplete === 1) {
         a.href = window.URL.createObjectURL(new Blob(window.video));
         a.download = 'video_' + document.title + '.mp4';  // Video file name
         a.click();
         window.downloadAll = 0; // Reset download status
         window.isComplete = 0;  // Reset completed video status
      }
   }

   setInterval(() => {
      if (window.downloadAll === 1 && window.isComplete === 1) {
         download();
      }
   }, 2000);

   if (window.autoDownload === 1) {
      let autoDownInterval = setInterval(() => {
         if (window.isComplete === 1) {
            download();
         }
      }, 2000);
   }

   (function (that) {
      let removeSandboxInterval = setInterval(() => {
         if (that.document.querySelectorAll('iframe')[0] !== undefined) {
            that.document.querySelectorAll('iframe').forEach((v, i, a) => {
               let ifr = v;
               ifr.removeAttribute('sandbox');
               const parentElem = that.document.querySelectorAll('iframe')[i].parentElement;
               a[i].remove();
               parentElem.appendChild(ifr);
            });
            clearInterval(removeSandboxInterval);
         }
      }, 1000);
   })(window);
})();
