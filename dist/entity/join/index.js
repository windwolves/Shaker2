!function(e,t,i){"use strict";function s(t){if(this.support=!("undefined"==typeof File||"undefined"==typeof Blob||"undefined"==typeof FileList||!Blob.prototype.slice&&!Blob.prototype.webkitSlice&&!Blob.prototype.mozSlice),this.support){this.supportDirectory=/WebKit/.test(e.navigator.userAgent),this.files=[],this.defaults={chunkSize:1048576,forceChunkSize:!1,simultaneousUploads:3,singleFile:!1,fileParameterName:"file",progressCallbacksInterval:500,speedSmoothingFactor:.1,query:{},headers:{},withCredentials:!1,preprocess:null,method:"multipart",testMethod:"GET",uploadMethod:"POST",prioritizeFirstAndLastChunk:!1,target:"/",testChunks:!0,generateUniqueIdentifier:null,maxChunkRetries:0,chunkRetryInterval:null,permanentErrors:[404,415,500,501],successStatuses:[200,201,202],onDropStopPropagation:!1},this.opts={},this.events={};var i=this;this.onDrop=function(e){i.opts.onDropStopPropagation&&e.stopPropagation(),e.preventDefault();var t=e.dataTransfer;t.items&&t.items[0]&&t.items[0].webkitGetAsEntry?i.webkitReadDataTransfer(e):i.addFiles(t.files,e)},this.preventEvent=function(e){e.preventDefault()},this.opts=s.extend({},this.defaults,t||{})}}function n(e,t){this.flowObj=e,this.file=t,this.name=t.fileName||t.name,this.size=t.size,this.relativePath=t.relativePath||t.webkitRelativePath||this.name,this.uniqueIdentifier=e.generateUniqueIdentifier(t),this.chunks=[],this.paused=!1,this.error=!1,this.averageSpeed=0,this.currentSpeed=0,this._lastProgressCallback=Date.now(),this._prevUploadedSize=0,this._prevProgress=0,this.bootstrap()}function r(e,t,i){this.flowObj=e,this.fileObj=t,this.fileObjSize=t.size,this.offset=i,this.tested=!1,this.retries=0,this.pendingRetry=!1,this.preprocessState=0,this.loaded=0,this.total=0;var s=this.flowObj.opts.chunkSize;this.startByte=this.offset*s,this.endByte=Math.min(this.fileObjSize,(this.offset+1)*s),this.xhr=null,this.fileObjSize-this.endByte<s&&!this.flowObj.opts.forceChunkSize&&(this.endByte=this.fileObjSize);var n=this;this.event=function(e,t){t=Array.prototype.slice.call(arguments),t.unshift(n),n.fileObj.chunkEvent.apply(n.fileObj,t)},this.progressHandler=function(e){e.lengthComputable&&(n.loaded=e.loaded,n.total=e.total),n.event("progress",e)},this.testHandler=function(e){var t=n.status(!0);"error"===t?(n.event(t,n.message()),n.flowObj.uploadNextChunk()):"success"===t?(n.tested=!0,n.event(t,n.message()),n.flowObj.uploadNextChunk()):n.fileObj.paused||(n.tested=!0,n.send())},this.doneHandler=function(e){var t=n.status();if("success"===t||"error"===t)n.event(t,n.message()),n.flowObj.uploadNextChunk();else{n.event("retry",n.message()),n.pendingRetry=!0,n.abort(),n.retries++;var i=n.flowObj.opts.chunkRetryInterval;null!==i?setTimeout(function(){n.send()},i):n.send()}}}function o(e,t){var i=e.indexOf(t);i>-1&&e.splice(i,1)}function a(e,t){return"function"==typeof e&&(t=Array.prototype.slice.call(arguments),e=e.apply(null,t.slice(1))),e}function l(e,t){setTimeout(e.bind(t),0)}function h(e,t){return u(arguments,function(t){t!==e&&u(t,function(t,i){e[i]=t})}),e}function u(e,t,i){if(e){var s;if("undefined"!=typeof e.length){for(s=0;s<e.length;s++)if(t.call(i,e[s],s)===!1)return}else for(s in e)if(e.hasOwnProperty(s)&&t.call(i,e[s],s)===!1)return}}var f=e.navigator.msPointerEnabled;s.prototype={on:function(e,t){e=e.toLowerCase(),this.events.hasOwnProperty(e)||(this.events[e]=[]),this.events[e].push(t)},off:function(e,t){e!==i?(e=e.toLowerCase(),t!==i?this.events.hasOwnProperty(e)&&o(this.events[e],t):delete this.events[e]):this.events={}},fire:function(e,t){t=Array.prototype.slice.call(arguments),e=e.toLowerCase();var i=!1;return this.events.hasOwnProperty(e)&&u(this.events[e],function(e){i=e.apply(this,t.slice(1))===!1||i},this),"catchall"!=e&&(t.unshift("catchAll"),i=this.fire.apply(this,t)===!1||i),!i},webkitReadDataTransfer:function(e){function t(e){o+=e.length,u(e,function(e){if(e.isFile){var n=e.fullPath;e.file(function(e){i(e,n)},s)}else e.isDirectory&&e.createReader().readEntries(t,s)}),n()}function i(e,t){e.relativePath=t.substring(1),a.push(e),n()}function s(e){throw e}function n(){0==--o&&r.addFiles(a,e)}var r=this,o=e.dataTransfer.items.length,a=[];u(e.dataTransfer.items,function(e){var r=e.webkitGetAsEntry();return r?void(r.isFile?i(e.getAsFile(),r.fullPath):r.createReader().readEntries(t,s)):void n()})},generateUniqueIdentifier:function(e){var t=this.opts.generateUniqueIdentifier;if("function"==typeof t)return t(e);var i=e.relativePath||e.webkitRelativePath||e.fileName||e.name;return e.size+"-"+i.replace(/[^0-9a-zA-Z_-]/gim,"")},uploadNextChunk:function(e){var t=!1;if(this.opts.prioritizeFirstAndLastChunk&&(u(this.files,function(e){return!e.paused&&e.chunks.length&&"pending"===e.chunks[0].status()&&0===e.chunks[0].preprocessState?(e.chunks[0].send(),t=!0,!1):!e.paused&&e.chunks.length>1&&"pending"===e.chunks[e.chunks.length-1].status()&&0===e.chunks[0].preprocessState?(e.chunks[e.chunks.length-1].send(),t=!0,!1):void 0}),t))return t;if(u(this.files,function(e){return e.paused||u(e.chunks,function(e){return"pending"===e.status()&&0===e.preprocessState?(e.send(),t=!0,!1):void 0}),t?!1:void 0}),t)return!0;var i=!1;return u(this.files,function(e){return e.isComplete()?void 0:(i=!0,!1)}),i||e||l(function(){this.fire("complete")},this),!1},assignBrowse:function(e,i,s,n){"undefined"==typeof e.length&&(e=[e]),u(e,function(e){var r;"INPUT"===e.tagName&&"file"===e.type?r=e:(r=t.createElement("input"),r.setAttribute("type","file"),h(r.style,{visibility:"hidden",position:"absolute"}),e.appendChild(r),e.addEventListener("click",function(){r.click()},!1)),this.opts.singleFile||s||r.setAttribute("multiple","multiple"),i&&r.setAttribute("webkitdirectory","webkitdirectory"),u(n,function(e,t){r.setAttribute(t,e)});var o=this;r.addEventListener("change",function(e){o.addFiles(e.target.files,e),e.target.value=""},!1)},this)},assignDrop:function(e){"undefined"==typeof e.length&&(e=[e]),u(e,function(e){e.addEventListener("dragover",this.preventEvent,!1),e.addEventListener("dragenter",this.preventEvent,!1),e.addEventListener("drop",this.onDrop,!1)},this)},unAssignDrop:function(e){"undefined"==typeof e.length&&(e=[e]),u(e,function(e){e.removeEventListener("dragover",this.preventEvent),e.removeEventListener("dragenter",this.preventEvent),e.removeEventListener("drop",this.onDrop)},this)},isUploading:function(){var e=!1;return u(this.files,function(t){return t.isUploading()?(e=!0,!1):void 0}),e},_shouldUploadNext:function(){var e=0,t=!0,i=this.opts.simultaneousUploads;return u(this.files,function(s){u(s.chunks,function(s){return"uploading"===s.status()&&(e++,e>=i)?(t=!1,!1):void 0})}),t&&e},upload:function(){var e=this._shouldUploadNext();if(e!==!1){this.fire("uploadStart");for(var t=!1,i=1;i<=this.opts.simultaneousUploads-e;i++)t=this.uploadNextChunk(!0)||t;t||l(function(){this.fire("complete")},this)}},resume:function(){u(this.files,function(e){e.resume()})},pause:function(){u(this.files,function(e){e.pause()})},cancel:function(){for(var e=this.files.length-1;e>=0;e--)this.files[e].cancel()},progress:function(){var e=0,t=0;return u(this.files,function(i){e+=i.progress()*i.size,t+=i.size}),t>0?e/t:0},addFile:function(e,t){this.addFiles([e],t)},addFiles:function(e,t){var i=[];u(e,function(e){if((!f||f&&e.size>0)&&(e.size%4096!==0||"."!==e.name&&"."!==e.fileName)&&!this.getFromUniqueIdentifier(this.generateUniqueIdentifier(e))){var s=new n(this,e);this.fire("fileAdded",s,t)&&i.push(s)}},this),this.fire("filesAdded",i,t)&&u(i,function(e){this.opts.singleFile&&this.files.length>0&&this.removeFile(this.files[0]),this.files.push(e)},this),this.fire("filesSubmitted",i,t)},removeFile:function(e){for(var t=this.files.length-1;t>=0;t--)this.files[t]===e&&(this.files.splice(t,1),e.abort())},getFromUniqueIdentifier:function(e){var t=!1;return u(this.files,function(i){i.uniqueIdentifier===e&&(t=i)}),t},getSize:function(){var e=0;return u(this.files,function(t){e+=t.size}),e},sizeUploaded:function(){var e=0;return u(this.files,function(t){e+=t.sizeUploaded()}),e},timeRemaining:function(){var e=0,t=0;return u(this.files,function(i){i.paused||i.error||(e+=i.size-i.sizeUploaded(),t+=i.averageSpeed)}),e&&!t?Number.POSITIVE_INFINITY:e||t?Math.floor(e/t):0}},n.prototype={measureSpeed:function(){var e=Date.now()-this._lastProgressCallback;if(e){var t=this.flowObj.opts.speedSmoothingFactor,i=this.sizeUploaded();this.currentSpeed=Math.max((i-this._prevUploadedSize)/e*1e3,0),this.averageSpeed=t*this.currentSpeed+(1-t)*this.averageSpeed,this._prevUploadedSize=i}},chunkEvent:function(e,t,i){switch(t){case"progress":if(Date.now()-this._lastProgressCallback<this.flowObj.opts.progressCallbacksInterval)break;this.measureSpeed(),this.flowObj.fire("fileProgress",this,e),this.flowObj.fire("progress"),this._lastProgressCallback=Date.now();break;case"error":this.error=!0,this.abort(!0),this.flowObj.fire("fileError",this,i,e),this.flowObj.fire("error",i,this,e);break;case"success":if(this.error)return;this.measureSpeed(),this.flowObj.fire("fileProgress",this,e),this.flowObj.fire("progress"),this._lastProgressCallback=Date.now(),this.isComplete()&&(this.currentSpeed=0,this.averageSpeed=0,this.flowObj.fire("fileSuccess",this,i,e));break;case"retry":this.flowObj.fire("fileRetry",this,e)}},pause:function(){this.paused=!0,this.abort()},resume:function(){this.paused=!1,this.flowObj.upload()},abort:function(e){this.currentSpeed=0,this.averageSpeed=0;var t=this.chunks;e&&(this.chunks=[]),u(t,function(e){"uploading"===e.status()&&(e.abort(),this.flowObj.uploadNextChunk())},this)},cancel:function(){this.flowObj.removeFile(this)},retry:function(){this.bootstrap(),this.flowObj.upload()},bootstrap:function(){this.abort(!0),this.error=!1,this._prevProgress=0;for(var e=this.flowObj.opts.forceChunkSize?Math.ceil:Math.floor,t=Math.max(e(this.file.size/this.flowObj.opts.chunkSize),1),i=0;t>i;i++)this.chunks.push(new r(this.flowObj,this,i))},progress:function(){if(this.error)return 1;if(1===this.chunks.length)return this._prevProgress=Math.max(this._prevProgress,this.chunks[0].progress()),this._prevProgress;var e=0;u(this.chunks,function(t){e+=t.progress()*(t.endByte-t.startByte)});var t=e/this.size;return this._prevProgress=Math.max(this._prevProgress,t>.9999?1:t),this._prevProgress},isUploading:function(){var e=!1;return u(this.chunks,function(t){return"uploading"===t.status()?(e=!0,!1):void 0}),e},isComplete:function(){var e=!1;return u(this.chunks,function(t){var i=t.status();return"pending"===i||"uploading"===i||1===t.preprocessState?(e=!0,!1):void 0}),!e},sizeUploaded:function(){var e=0;return u(this.chunks,function(t){e+=t.sizeUploaded()}),e},timeRemaining:function(){if(this.paused||this.error)return 0;var e=this.size-this.sizeUploaded();return e&&!this.averageSpeed?Number.POSITIVE_INFINITY:e||this.averageSpeed?Math.floor(e/this.averageSpeed):0},getType:function(){return this.file.type&&this.file.type.split("/")[1]},getExtension:function(){return this.name.substr((~-this.name.lastIndexOf(".")>>>0)+2).toLowerCase()}},r.prototype={getParams:function(){return{flowChunkNumber:this.offset+1,flowChunkSize:this.flowObj.opts.chunkSize,flowCurrentChunkSize:this.endByte-this.startByte,flowTotalSize:this.fileObjSize,flowIdentifier:this.fileObj.uniqueIdentifier,flowFilename:this.fileObj.name,flowRelativePath:this.fileObj.relativePath,flowTotalChunks:this.fileObj.chunks.length}},getTarget:function(e,t){return e+=e.indexOf("?")<0?"?":"&",e+t.join("&")},test:function(){this.xhr=new XMLHttpRequest,this.xhr.addEventListener("load",this.testHandler,!1),this.xhr.addEventListener("error",this.testHandler,!1);var e=a(this.flowObj.opts.testMethod,this.fileObj,this),t=this.prepareXhrRequest(e,!0);this.xhr.send(t)},preprocessFinished:function(){this.preprocessState=2,this.send()},send:function(){var e=this.flowObj.opts.preprocess;if("function"==typeof e)switch(this.preprocessState){case 0:return this.preprocessState=1,void e(this);case 1:return}if(this.flowObj.opts.testChunks&&!this.tested)return void this.test();this.loaded=0,this.total=0,this.pendingRetry=!1;var t=this.fileObj.file.slice?"slice":this.fileObj.file.mozSlice?"mozSlice":this.fileObj.file.webkitSlice?"webkitSlice":"slice",i=this.fileObj.file[t](this.startByte,this.endByte,this.fileObj.file.type);this.xhr=new XMLHttpRequest,this.xhr.upload.addEventListener("progress",this.progressHandler,!1),this.xhr.addEventListener("load",this.doneHandler,!1),this.xhr.addEventListener("error",this.doneHandler,!1);var s=a(this.flowObj.opts.uploadMethod,this.fileObj,this),n=this.prepareXhrRequest(s,!1,this.flowObj.opts.method,i);this.xhr.send(n)},abort:function(){var e=this.xhr;this.xhr=null,e&&e.abort()},status:function(e){return this.pendingRetry||1===this.preprocessState?"uploading":this.xhr?this.xhr.readyState<4?"uploading":this.flowObj.opts.successStatuses.indexOf(this.xhr.status)>-1?"success":this.flowObj.opts.permanentErrors.indexOf(this.xhr.status)>-1||!e&&this.retries>=this.flowObj.opts.maxChunkRetries?"error":(this.abort(),"pending"):"pending"},message:function(){return this.xhr?this.xhr.responseText:""},progress:function(){if(this.pendingRetry)return 0;var e=this.status();return"success"===e||"error"===e?1:"pending"===e?0:this.total>0?this.loaded/this.total:0},sizeUploaded:function(){var e=this.endByte-this.startByte;return"success"!==this.status()&&(e=this.progress()*e),e},prepareXhrRequest:function(e,t,i,s){var n=a(this.flowObj.opts.query,this.fileObj,this,t);n=h(this.getParams(),n);var r=a(this.flowObj.opts.target,this.fileObj,this,t),o=null;if("GET"===e||"octet"===i){var l=[];u(n,function(e,t){l.push([encodeURIComponent(t),encodeURIComponent(e)].join("="))}),r=this.getTarget(r,l),o=s||null}else o=new FormData,u(n,function(e,t){o.append(t,e)}),o.append(this.flowObj.opts.fileParameterName,s,this.fileObj.file.name);return this.xhr.open(e,r,!0),this.xhr.withCredentials=this.flowObj.opts.withCredentials,u(a(this.flowObj.opts.headers,this.fileObj,this,t),function(e,t){this.xhr.setRequestHeader(t,e)},this),o}},s.evalOpts=a,s.extend=h,s.each=u,s.FlowFile=n,s.FlowChunk=r,s.version="2.9.0","object"==typeof module&&module&&"object"==typeof module.exports?module.exports=s:(e.Flow=s,"function"==typeof define&&define.amd&&define("flow",[],function(){return s}))}(window,document),$(function(){"use strict";function e(e){c=e;var i=location.pathname.split("/").slice(1)[1];$.getJSON("/services/entity/"+i,function(e){if("success"==e.status){var i=e.data;$.getJSON("/services/theme/"+i.themeId,function(e){"success"==e.status&&(i.Theme=e.data,t(i))})}else console.error(e.data)})}function t(e){b.entity=e,wechat.share({link:location.origin+"/entity/"+e.id,imgUrl:(location.origin+e.picture).replace(/.*http/g,"http"),title:e.title,description:e.content}),$('<link rel="stylesheet"/>').attr("href","/page/"+e.Theme.code+"/css/style.css").appendTo("head"),$.get("/page/"+e.Theme.code+"/index.html",function(e){$('<script id="card-template" type="text/html"/>').html(e).appendTo("body"),d=$(".panel"),i(),s(),n(),o(),l()})}function i(){var e=$(".join-footer-bar");e.find(".join-footer-bar-list").on("click",function(){r(),p.addClass("smaller"),v.addClass("in")}),e.find(".join-footer-bar-add").on("click",function(){l()}),e.find(".join-footer-bar-layout").on("click",function(){a(b.cards[m.activeIndex]),p.addClass("smaller"),g.addClass("in")}),e.find(".join-footer-bar-publish").on("click",function(){var e=[],t=b.cards.every(function(t,i){e.push({contents:t.contents,pictures:t.pictures,layoutId:t.Layout.id});var s=$(m.slides[i]),n=s.find(".picture").length,r=s.find(".content").length,o=t.pictures.filter(function(e){return e!=y}),a=t.contents.filter(function(e){return e});if(n){if(o.length<n)return m.slideTo(i),alert("请先上传图片再发布！"),!1}else if(a.length<r)return m.slideTo(i),alert("请先上传填写文字再发布！"),!1;return!0});if(t){var i=$.param({_username:c.username,_password:c.password}),s={entityId:b.entity.id,cards:e};$.post("/services/post?"+i,s,function(e){"success"==e.status?location.href="/entity/"+e.data.entityId+"/joined/"+e.data.id:console.error(e)})}})}function s(){p=$(".preview-container").append(template("preview-template",b)),m=new Swiper(p[0],{preloadImages:!1,lazyLoading:!0,lazyLoadingInPrevNext:!0,lazyLoadingOnTransitionStart:!0,onTap:function(){p.removeClass("smaller"),v.removeClass("in"),g.removeClass("in")}})}function n(){v=$(".card-list");var e=v.find(".swiper-container"),t=e.height(),i=d.height(),s=t/i,n=e.css({height:i})[0].style;n.webkitTransform=n.MsTransform=n.msTransform=n.MozTransform=n.OTransform=n.transform="scale("+s+")",v.find(".join-bar-close").on("click",function(){p.removeClass("smaller"),v.removeClass("in")}),v.find(".join-bar-save").on("click",function(){p.removeClass("smaller"),v.removeClass("in")}),v.on("click",".join-bar-remove",function(){var e=$(this).parent().index();b.cards.splice(e,1),r()})}function r(){var e=$(".card-list .swiper-container").html(template("card-list-template",b));new Swiper(e[0],{slideActiveClass:"active",initialSlide:m.activeIndex,spaceBetween:200,slideToClickedSlide:!0,preloadImages:!1,lazyLoading:!0,lazyLoadingInPrevNext:!0,lazyLoadingOnTransitionStart:!0,onSlideChangeStart:function(e){m.slideTo(e.activeIndex)}})}function o(){g=$(".layout-list"),g.find(".join-bar-close").on("click",function(){p.removeClass("smaller"),g.removeClass("in")}),g.find(".join-bar-save").on("click",function(){p.removeClass("smaller"),g.removeClass("in")})}function a(e){var t,i,s=b.entity.Theme,n=$(".layout-list .swiper-container").html(template("layout-list-template",s));for(t=0,i=s.Layouts.length;i>t&&e.Layout.code!=s.Layouts[t].code;t++);new Swiper(n[0],{slideActiveClass:"active",initialSlide:t,slidesPerView:3,centeredSlides:!0,slideToClickedSlide:!0,onSlideChangeStart:function(t){var i=t.activeIndex,n=s.Layouts[i];e.Layout=n,e.layoutId=n.id,h(e)},onTap:function(t){var i=t.activeIndex,n=s.Layouts[i];e.Layout=n,e.layoutId=n.id,h(e)}})}function l(){var e=b.entity.Theme.Layouts[0],t={layoutId:e.id,Layout:e,contents:[],pictures:[y]};if(b.cards.push(t),m){m.appendSlide('<div class="swiper-slide">'+template("card-template",t)+"</div>");var i=m.slides.length-1,s=$(m.slides[i]);m.slideTo(i),m.lazy.loadImageInSlide(i),u(s,t)}}function h(e){var t=b.cards.indexOf(e);m&&(m.slides[t].innerHTML=template("card-template",e),m.lazy.loadImageInSlide(t),u($(m.slides[t]),e))}function u(e,t){e.find(".picture").each(function(e){t.pictures[e]!=y&&$(this).addClass("uploaded"),f(this,t,e)}),e.find(".content").each(function(e){var i=$(this),s=i.html();i.html("");var n=$('<textarea class="input-content"/>').attr("placeholder","输入内容").appendTo(i);n.val(s),n.on("blur",function(){t.contents[e]=n.val()})})}function f(e,t,i){var s=new Flow({target:"/upload",chunkSize:1048576,testChunks:!1});s.assignBrowse(e,!1,!0,{accept:"image/*"}),s.on("filesSubmitted",function(e){s.upload()}),s.on("fileSuccess",function(e,s){try{var n=JSON.parse(s);if("success"==n.status){var r=n.data[0].replace(/\\/g,"/");t.pictures[i]=r,h(t)}else console.log(n)}catch(o){console.error(s)}})}"undefined"!=typeof wechat&&wechat.auth(e);var c,d,p,v,g,m,b={cards:[]},y="/entity/join/img/picture-placeholder.jpg"});