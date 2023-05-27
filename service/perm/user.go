package perm

import (
	"github.com/cloudreve/Cloudreve/v3/pkg/serializer"
	"strings"

	model "github.com/cloudreve/Cloudreve/v3/models"
)

var (
	ErrNoPermit = serializer.NewError(serializer.NO_PERM, "没有权限操作", nil)
)

// PermService 用户ID服务
type PermService struct {
	ID uint `uri:"id" json:"id" binding:"required"`
}

func (service *PermService) CheckPerm(currentPath string, user *model.User) error {
	if user.ID == 1 {
		return nil
	}
	pathPrefixes := strings.Split(user.Dirs, ",")
	for _, prefix := range pathPrefixes {
		if currentPath == prefix {
			return nil
		}
	}
	return &ErrNoPermit

}
func (service *PermService) CheckAction(action string, user *model.User) error {
	err := model.CheckAction(action, user)
	if err != nil {
		return &ErrNoPermit
	}
	return nil
}
