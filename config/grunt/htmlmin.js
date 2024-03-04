module.exports = {
    default: {
        files: [
            {
                cwd: 'build/web-audio-conference-2024/browser',
                dest: 'build/web-audio-conference-2024/browser',
                expand: true,
                src: ['**/404.html']
            }
        ],
        options: {
            caseSensitive: true,
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            minifyCSS: true,
            removeComments: true
        }
    }
};
