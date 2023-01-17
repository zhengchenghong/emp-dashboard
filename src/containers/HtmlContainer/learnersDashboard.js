module.exports = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="./src/css/modal.css">
    <link rel="stylesheet" href="./src/css/treeview.css">
    <link rel="stylesheet" href="./src/css/spinner.css">
    <!-- Add the slick-theme.css if you want default styling -->
    <link rel="stylesheet" type="text/css" href="./src/css/slick.css" />
    <!-- Add the slick-theme.css if you want default styling -->
    <link rel="stylesheet" type="text/css" href="./src/css/slick-theme.css" />
    <link rel="stylesheet" href="./src/css/dialog.css">
    <link rel="icon" href="./assets/favicon.ico" type="image/gif" sizes="16x16">

</head>

<body class="dashboard">

    <div class="app-container">
        <a href="#banner-span" style="display:none;">Skip to main content</a>
        <div class="menu-bar">
            <a class="main-logo" href="./dashboard.html"><img src="./assets/PMEP.png" alt="PMEP"></a>
            <ul class="student-id">
                <li><a class="menu-bar-button" href="#"><img alt="profile" class="student-id-img"
                            src="./assets/icon-avatart.png">
                            <img alt="arrow" class="student-arrow-img"
                            src="./assets/icon-down-arrow.png">
                    </a>
                    <ul class="student-id-dropdown">
                        <span class="login-user-name menu-bar-label">Matt Wilson</span>
                        <li>
                            <a href="javascript:switchStudent()">
                                <div class="student-id-button">
                                    <img class="student-id-icon" src="./assets/icon-switch.png">
                                    <span class="side-footer-label">Switch Student</span>
                                </div>
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>

        <div class="main-container main-content">
            <div id="student-banner" style="display: block;"><img src="" alt="student">
                <h1 id="banner-span" name="banner-span" class="student-desc__title"></h1>
                <div id="lastUpdated">Last Updated: <span></span></div>
            </div>
            <div class="student-content">
                <div class="student-detail">
                    <div id="student-desc" style="display: block;">
                        <p class="student-desc__short"></p>
                        <p class="student-desc__long"></p>
                    </div>
                    <div id="student-body" style="display: block;">

                    </div>
                    <div class="div__more-info">
                        <h2>Attachments</h2>
                    </div>
                    <div id="student-attachments-content">

                    </div>
                    <a class="backToDash" href="./dashboard.html">Back to Dashboard</a>
                </div>
                <div id="student-attachments">
                    <div class="div__contact-info">
                        <h2>Your Teacher</h2>
                        <p class="teacher teacher-fullname"></p>
                        <p class="teacher teacher-email"></p>
                        <p class="teacher teacher-phone"></p>
                        <div class="div__course-info">
                            <p><span class="class-name"></span></p>
                            <p><span class="school-name" style="display: inline;"></span></p>
                            <p><span class="district-name" style="display: inline;"></span></p>
                        </div>
                    </div>
                    <div class="div__pbs-learningmedia" style="display: none;">
                        <hr>
                        <p>This lesson contains resources from</p>
                        <img title="PBS LearningMedia" alt="PBS LearningMedia" alt="WITF" src="./assets/pbslm-logo.svg">
                    </div>
                    <hr>
                    <div class="div__station-id">
                        <h2>Technical Support</h2>
                        <p>Hotline: <a class="tel-station"></a></p>
                        <img class="img-station" alt="station" />
                        <div class="copyright">©2022 PMEP</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- The Preview Modal -->
    <div id="previewModal" class="modal">

        <!-- Modal content -->
        <div class="modal-content">
            <div class="modal-header">
                <span class="close">&times;</span>
                <h2>Preview</h2>
            </div>
            <div class="modal-body">
                <div class="file-name">

                </div>
                <div class="file-url"></div>
                <img style="width:100%; height: 100%;" class="preview-img" src="" alt="preview" />
                <iframe width="100%" height="100%" class="preview-video" src=""></iframe>
                <embed class="preview-pdf" src="" type="application/pdf" width="100%" height="100%" />
            </div>
            <div class="modal-footer">
                <a class="btn btn-cancel">Cancel</a>
                <a class="btn btn-download" target="_blank" download>Download</a>
            </div>
        </div>

    </div>

    <!-- The Settings Modal -->
    <div id="settingsModal" class="modal">

        <!-- Modal content -->
        <div class="modal-content">
            <div class="modal-header">
                <span class="close">&times;</span>
                <h2>Select Your Avatars</h2>
            </div>
            <div class="modal-body" style="background-color: #bbbbbb;">
                <div style="height: 200px; padding: 0 60px;">
                    <div id="avatar-items">

                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <a class="btn btn-cancel">Close</a>
                <a class="btn btn-select" target="_blank" download>Select</a>
            </div>
        </div>

    </div>

    <!-- <iframe id="download_iframe" src=""></iframe> -->
    <div class="spinner">
        <div class="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>

    <div id="dialog-overlay"></div>
    <div id="dialog-box">
        <div class="dialog-content">
            <div id="dialog-message"></div>
            <div id="dialog-buttons">
                <a href="#" class="button" id="retry">Retry</a>
                <a href="#" class="button" id="close">Close</a>
            </div>
        </div>
    </div>

    <div class="banner-alert" id="banner-alert">
    </div>

    <script src="./src/js/header.js"></script>
    <script type="text/javascript" src="./src/color.json"></script>
    <script src="./src/js/jquery-3.3.1.min.js"></script>
    <script src="./src/js/aws.js"></script>
    <script src="./src/js/dialog.js"></script>
    <script type="text/javascript" src="./src/js/slick.min.js"></script>
    <script src='./src/js/color.js'></script>
    <script src='./src/js/config.js'></script>
    <script src='./src/js/sidemenu.js'></script>
    <script src='./src/js/lesson.js'></script>
    <script src='./src/js/settings.js'></script>
</body>

</html>`;
