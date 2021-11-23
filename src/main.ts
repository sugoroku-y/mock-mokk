import {mokkServer} from './mokkServer';
import {parseOptions} from './parseOptions';

const {port, index, files} = parseOptions();
mokkServer(port, index, files);
