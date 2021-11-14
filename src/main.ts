import {mockServer} from './mockServer';
import {parseOptions} from './parseOptions';

const {port, index, files} = parseOptions();
mockServer(port, index, files);
