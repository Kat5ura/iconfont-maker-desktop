<style lang="scss">
  .advance-maker {
    padding: 20px;

    .icons-wrapper{

      .el-form-item__content{
        display: flex;
        max-height: 150px;
        overflow: overlay;
        flex-wrap: wrap;

        &>div:first-child{
          display: inline-block;
        }
      }

      .el-upload.el-upload--text{
        .el-button{
          display: inline-block;
          width: 50px;
          height: 50px;
          border-radius: 25px;
        }
      }

      .svg-list-item {
        position: relative;
        display: inline-block;
        padding: 15px;
        width: 50px;
        height: 50px;
        margin-left: 5px;
        border: 1px solid silver;
        border-radius: 25px;

        img {
          display: block;
          width: 100%;
          height: 100%;
        }

        &:hover .icon-mask {
          display: block;
        }

        .icon-mask {
          display: none;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          border-radius: 25px;
          line-height: 50px;
          text-align: center;
          color: #ff4c4c;
          background-color: rgba(0, 0, 0, .8);
          transition: all ease .5s;
          cursor: pointer;
        }
      }
    }

    & * {
      box-sizing: border-box;
    }


  }
</style>
<template>
  <div class="advance-maker">
    <el-form labelPosition="top">
      <el-form-item class="icons-wrapper" label="SVG 图标:">
        <el-upload
            ref="uploader"
            action=""
            accept=".svg"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="onIconChange"
        >
          <el-button><i class="el-icon-plus"></i></el-button>
        </el-upload>
        <div class="svg-list-item" :key="i" v-for="(icon, i) in iconList">
          <img :src="icon.url" :alt="icon.name">
          <div class="icon-mask" @click="removeIcon(icon.uid)">
            <i class="el-icon-delete"></i>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="输出到">
        <el-input v-model="outputDir" disabled>
          <el-button @click="chooseOutputDir" slot="append" icon="edit"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :disabled="!iconList.length || !outputDir" @click="make">生成 IconFont</el-button>
      </el-form-item>
    </el-form>

    <el-collapse accordion>
      <el-collapse-item title="高级设置">
        <el-form>
          <el-form-item label="字体名称">
            <el-input v-model="options.iconfontName"></el-input>
          </el-form-item>

          <el-form-item label="生成 CSS">
            <el-switch v-model="options.css" onText="" offText=""></el-switch>
          </el-form-item>

          <el-form-item label="CSS 输出到" v-if="options.css">
            <div style="float: right">
              <span>自定义</span>
              <el-switch v-model="customCssDest"></el-switch>
            </div>
            <el-input v-if="!customCssDest" v-model="defaultCssDest" disabled></el-input>
            <el-input v-model="options.cssDest" v-if="customCssDest">
              <el-button slot="append" icon="edit" @click="chooseCssDest"></el-button>
            </el-input>
          </el-form-item>

        </el-form>
      </el-collapse-item>
    </el-collapse>

  </div>
</template>

<script>
	const path = require('path')

	export default {
		data () {
			return {
				ipc: null,
				iconList: [],
				outputDir: '',

				customCssDest: false,
				cssDir: '',
				options: {
					iconfontName: 'iconfont',
					css: true,
					cssDest: '',
					cssFontsPath: ''
				}
			}
		},

		computed: {
			fileList () {
				return this.iconList.map(icon => {
					return icon.raw.path
				})
			},

			defaultCssDest () {
				if (!this.outputDir) return ''
				let cssDest = path.join(this.outputDir, this.options.iconfontName + '.css')
				if (!this.options.cssDest) this.options.cssDest = cssDest
				return cssDest
			}
		},

		methods: {
			make () {
				let maker = require('iconfont-maker')
				console.log('Starting...')
				let options = {
					files: this.fileList,
					dest: this.outputDir
				}
				maker(Object.assign(options, this.options), _ => {
					this.$alert('生成成功！', '提示')
				})
			},

			onIconChange (file, fileList) {
				this.iconList = fileList.map(file => {
					return file
				})
			},

			removeIcon (uid) {
				this.iconList = this.iconList.filter(icon => {
					return icon.uid !== uid
				})

				this.$refs.uploader.uploadFiles = this.iconList
			},

			chooseOutputDir () {
				this.ipc.send('open-destination-dialog')
			},

			chooseCssDest () {
				this.ipc.send('open-css-destination-dialog')
			}
		},

		watch: {
			'options.iconfontName' (val) {
				let cssDest = this.options.cssDest
				if (cssDest && this.cssDir) {
					this.options.cssDest = path.join(this.cssDir, val + '.css')
				}
			},

			customCssDest (val) {
				if (!val) {
					this.options.cssDest = this.defaultCssDest
					this.cssDir = ''
					this.options.cssFontsPath = ''
				}
			}
		},

		mounted () {
			this.ipc = this.$electron.ipcRenderer
			this.ipc.on('selected-directory', (event, dir) => {
				this.outputDir = dir[0]
			})
			this.ipc.on('selected-css-directory', (event, dir) => {
				this.cssDir = dir[0]
				this.options.cssDest = path.join(dir[0], this.options.iconfontName + '.css')
				this.options.cssFontsPath = path.relative(dir[0], this.outputDir)
			})
		},

		beforeDestroy () {
			this.ipc.removeAllListeners('selected-directory')
			this.ipc.removeAllListeners('selected-css-directory')
			this.ipc = null
		}

	}
</script>
