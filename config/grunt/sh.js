module.exports = () => {
    return {
        'analyze': {
            cmd: `npx ng build --configuration production --source-map --stats-json && \
                webpack-bundle-analyzer build/web-audio-conference-2024/stats.json`
        },
        'build': {
            cmd: 'npx ng build --base-href /web-audio-conference-2024/ --configuration production --subresource-integrity'
        },
        'rimraf-source-maps': {
            cmd: 'rimraf build/web-audio-conference-2024/browser/**.map'
        },
        'verify': {
            cmd: `npx bundle-buddy build/web-audio-conference-2024/browser/*.js.map && \
                grep -r build/web-audio-conference-2024/browser/*.js.map -e '/environments/environment.ts'; test $? -eq 1`
        }
    };
};
