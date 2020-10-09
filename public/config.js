const Config = {
    app_id: '3074457349449985399',
    icon: '<svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">\n'
        + '    <g id="icon-24" stroke="currentColor" stroke-width="2" fill="none" fill-rule="evenodd">\n'
        + '        <path d="M12 12 L 12 4 M12 12 L 18 12"/>\n'
        + '        <circle cx="12" cy="12" r="10"/>\n'
        + '        <circle cx="12" cy="12" r="1" fill="currentColor"/>\n'
        + '    </g>\n'
        + '</svg>',
    spinner_element: '<div class="loader-ring"><div></div><div></div><div></div><div></div></div>',
    modal_options: {
        width: 300,
        height: 250
    }, 
    bottompanel_options: {
        width: 240,
        height: 100
    },
    team_api: 'https://fm-tools.github.io/miro-estimate/public/team',
    auth_api: 'https://fm-tools.github.io/miro-estimate/public/auth',
    websocket: 'wss://fm-tools.github.io/miro-estimate/public/',
    supported_widgets: {
        text: 'plainText',
        image: 'title',
        sticker: 'string',
        shape: 'plainText',
        frame: 'title',
        card: 'title',
        document: 'title'
    }

};