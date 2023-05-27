package explorer

import (
	"context"
	model "github.com/cloudreve/Cloudreve/v3/models"
	"github.com/cloudreve/Cloudreve/v3/pkg/filesystem"
	"github.com/cloudreve/Cloudreve/v3/pkg/serializer"
	"github.com/cloudreve/Cloudreve/v3/service/perm"
	"github.com/gin-gonic/gin"
)

// DirectoryService 创建新目录服务
type DirectoryService struct {
	Path string `uri:"path" json:"path" binding:"required,min=1,max=65535"`
}

// ListDirectory 列出目录内容
func (service *DirectoryService) ListDirectory(c *gin.Context) serializer.Response {
	// 创建文件系统
	fs, err := filesystem.NewFileSystemFromContext(c)
	if err != nil {
		return serializer.Err(serializer.CodeCreateFSError, "", err)
	}
	defer fs.Recycle()

	// 上下文
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	userFace, _ := c.Get("user")

	userModel := userFace.(*model.User)

	var userService perm.PermService
	err = userService.CheckPerm(service.Path, userModel)
	if err != nil {
		return serializer.Err(serializer.NO_PERM, err.Error(), err)
	}

	// 获取子项目
	objects, err := fs.List(ctx, service.Path, nil)
	if err != nil {
		return serializer.Err(serializer.CodeNotSet, err.Error(), err)
	}

	var parentID uint
	if len(fs.DirTarget) > 0 {
		parentID = fs.DirTarget[0].ID
	}

	return serializer.Response{
		Code: 0,
		Data: serializer.BuildObjectList(parentID, objects, fs.Policy),
	}
}

// CreateDirectory 创建目录
func (service *DirectoryService) CreateDirectory(c *gin.Context) serializer.Response {

	userCtx, _ := c.Get("user")
	user := userCtx.(*model.User)

	var perm perm.PermService

	err := perm.CheckAction("add", user)
	if err != nil {
		return serializer.Err(serializer.NO_PERM, "", err)
	}

	// 创建文件系统
	fs, err := filesystem.NewFileSystemFromContext(c)
	if err != nil {
		return serializer.Err(serializer.CodeCreateFSError, "", err)
	}
	defer fs.Recycle()

	// 上下文
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 创建目录
	_, err = fs.CreateDirectory(ctx, service.Path)
	if err != nil {
		return serializer.Err(serializer.CodeCreateFolderFailed, err.Error(), err)
	}
	return serializer.Response{
		Code: 0,
	}

}
