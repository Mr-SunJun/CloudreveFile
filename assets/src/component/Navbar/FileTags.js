import React, { Suspense, useCallback, useState } from "react";
import {
    Divider,
    List,
    ListItemIcon,
    ListItemText,
    makeStyles,
    withStyles,
} from "@material-ui/core";
import { Clear, KeyboardArrowRight } from "@material-ui/icons";
import classNames from "classnames";
import FolderShared from "@material-ui/icons/FolderShared";
import UploadIcon from "@material-ui/icons/CloudUpload";
import VideoIcon from "@material-ui/icons/VideoLibraryOutlined";
import Folder from "@material-ui/icons/Folder";
import ImageIcon from "@material-ui/icons/CollectionsOutlined";
import MusicIcon from "@material-ui/icons/LibraryMusicOutlined";
import DocIcon from "@material-ui/icons/FileCopyOutlined";
import CreateNewFolderIcon from "@material-ui/icons/CreateNewFolder";
import { useHistory, useLocation } from "react-router";
import pathHelper from "../../utils/page";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";
import MuiExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import MuiExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import MuiListItem from "@material-ui/core/ListItem";
import { useDispatch } from "react-redux";
import Auth from "../../middleware/Auth";
import {
    Circle,
    CircleOutline,
    FolderHeartOutline,
    Heart,
    HeartOutline,
    Hexagon,
    HexagonOutline,
    Hexagram,
    HexagramOutline,
    Rhombus,
    RhombusOutline,
    Square,
    SquareOutline,
    TagPlus,
    Triangle,
    TriangleOutline,
} from "mdi-material-ui";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import API from "../../middleware/Api";
import { navigateTo, searchMyFile, toggleSnackbar } from "../../redux/explorer";
import { useTranslation } from "react-i18next";

const ListItem = withStyles((theme) => ({
    root: {
        borderRadius:theme.shape.borderRadius,
    },
}))(MuiListItem);

const ExpansionPanel = withStyles({
    root: {
        maxWidth: "100%",
        boxShadow: "none",
        "&:not(:last-child)": {
            borderBottom: 0,
        },
        "&:before": {
            display: "none",
        },
        "&$expanded": { margin: 0 },
    },
    expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles((theme) =>({
    root: {
        minHeight: 0,
        padding: 0,
        "&$expanded": {
            minHeight: 0,
        },
    },
    content: {
        maxWidth: "100%",
        margin: 0,
        display: "block",
        "&$expanded": {
            margin: "0",
        },
    },
    expanded: {},
}))(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles((theme) => ({
    root: {
        display: "block",
        padding: theme.spacing(0),
    },
}))(MuiExpansionPanelDetails);

const useStyles = makeStyles((theme) => ({
    expand: {
        display: "none",
        transition: ".15s all ease-in-out",
    },
    expanded: {
        display: "block",
        transform: "rotate(90deg)",
    },
    iconFix: {
        marginLeft: "16px",
    },
    hiddenButton: {
        display: "none",
    },
    subMenu: {
        marginLeft: theme.spacing(2),
    },
    overFlow: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    paddingList:{
        padding:theme.spacing(1),
    },
    paddingSummary:{
        paddingLeft:theme.spacing(1),
        paddingRight:theme.spacing(1),
    }
}));

const icons = {
    Circle: Circle,
    CircleOutline: CircleOutline,
    Heart: Heart,
    HeartOutline: HeartOutline,
    Hexagon: Hexagon,
    HexagonOutline: HexagonOutline,
    Hexagram: Hexagram,
    HexagramOutline: HexagramOutline,
    Rhombus: Rhombus,
    RhombusOutline: RhombusOutline,
    Square: Square,
    SquareOutline: SquareOutline,
    Triangle: Triangle,
    TriangleOutline: TriangleOutline,
    FolderHeartOutline: FolderHeartOutline,
    Folder:Folder
};

const AddTag = React.lazy(() => import("../Modals/AddTag"));

export default function FileTag() {
    const classes = useStyles();
    const { t } = useTranslation();

    const location = useLocation();
    const history = useHistory();

    const isHomePage = pathHelper.isHomePage(location.pathname);

    const [tagOpen, setTagOpen] = useState(true);
    const [addTagModal, setAddTagModal] = useState(false);
    const [tagHover, setTagHover] = useState(null);
    const [tags, setTags] = useState(
        Auth.GetUser().tags ? Auth.GetUser().tags : []
    );

    const dispatch = useDispatch();
    const SearchMyFile = useCallback((k, p) => dispatch(searchMyFile(k, p)), [
        dispatch,
    ]);
    const NavigateTo = useCallback((k) => dispatch(navigateTo(k)), [dispatch]);

    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const getIcon = (icon, color) => {
        if (icons[icon]) {
            const IconComponent = icons[icon];
            return (
                <IconComponent
                    className={[classes.iconFix]}
                    style={
                        color
                            ? {
                                  color: color,
                              }
                            : {}
                    }
                />
            );
        }
        return <Circle className={[classes.iconFix]} />;
    };

    const submitSuccess = (tag) => {
        const newTags = [...tags, tag];
        setTags(newTags);
        const user = Auth.GetUser();
        user.tags = newTags;
        Auth.SetUser(user);
    };

    const submitDelete = (id) => {
        API.delete("/tag/" + id)
            .then(() => {
                const newTags = tags.filter((v) => {
                    return v.id !== id;
                });
                setTags(newTags);
                const user = Auth.GetUser();
                user.tags = newTags;
                Auth.SetUser(user);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    return (
        <>
            <Suspense fallback={""}>
                <AddTag
                    onSuccess={submitSuccess}
                    open={addTagModal}
                    onClose={() => setAddTagModal(false)}
                />
            </Suspense>
            <ExpansionPanel
                square
                expanded={tagOpen && isHomePage}
                onChange={() => isHomePage && setTagOpen(!tagOpen)}
            >
                <ExpansionPanelSummary
                    aria-controls="panel1d-content"
                    id="panel1d-header"
                >
                    <div className={classes.paddingSummary}>
                        <ListItem
                            button
                            key="我的文件"
                            onClick={() =>
                                !isHomePage && history.push("/home?path=%2F")
                            }
                        >
                            <ListItemIcon>
                                <KeyboardArrowRight
                                    className={classNames(
                                        {
                                            [classes.expanded]:
                                            tagOpen && isHomePage,
                                            [classes.iconFix]: true,
                                        },
                                        classes.expand
                                    )}
                                />
                                {!(tagOpen && isHomePage) && (
                                    <FolderShared className={classes.iconFix} />
                                )}
                            </ListItemIcon>
                            <ListItemText primary={t("navbar.myFiles")} />
                        </ListItem>
                    </div>

                    <Divider />
                </ExpansionPanelSummary>

                <ExpansionPanelDetails>
                    <List className={classes.paddingList} onMouseLeave={() => setTagHover(null)}>
                        {tags.map((v) => (
                            <ListItem
                                button
                                key={v.id}
                                onMouseEnter={() => setTagHover(v.id)}
                                onClick={() => {
                                    if (v.type === 0) {
                                        SearchMyFile("tag/" + v.id, "");
                                    } else {
                                        NavigateTo(v.expression);
                                    }
                                }}
                            >
                                <ListItemIcon className={classes.subMenu}>
                                    {getIcon(
                                        v.type === 0
                                            ? v.icon
                                            : "Folder",
                                        v.type === 0 ? v.color : null
                                    )}
                                </ListItemIcon>
                                <ListItemText
                                    className={classes.overFlow}
                                    primary={v.name}
                                />

                                {tagHover === v.id && (
                                    <ListItemSecondaryAction
                                        onClick={() => submitDelete(v.id)}
                                    >
                                        <IconButton
                                            size={"small"}
                                            edge="end"
                                            aria-label="delete"
                                        >
                                            <Clear />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                )}
                            </ListItem>
                        ))}

                        <ListItem button onClick={() => setAddTagModal(true)}>
                            <CreateNewFolderIcon className={classes.subMenu}>
                                <TagPlus className={classes.iconFix} />
                            </CreateNewFolderIcon>
                            <ListItemText primary={t("navbar.addATag")} />
                        </ListItem>
                    </List>{" "}
                    <Divider />
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </>
    );
}