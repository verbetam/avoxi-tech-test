const APIRoot = '/api';

const buildAPIURI = (path, params = {}) => {
    let URI = APIRoot + (path.charAt(0) === '/' ? path : '/' + path);

    if (params && Object.keys(params).length) {
        URI += '?';
        let URIComponents = [];
        for (let key of Object.keys(params)) {
            URIComponents.push(key + '=' + encodeURIComponent(params[key]));
        }
        URI += URIComponents.join('&');
    }

    return URI;
}

export default buildAPIURI;