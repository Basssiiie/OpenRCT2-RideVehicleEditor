import hello from './hello';
import {
  getPeeps,
  getStaff,
  getHandymen,
  getMechanics,
  getSecurity,
  getEntertainers,
} from './helpers';

const main = (): void => {
  console.log(`${hello()} Your plug-in has started!`);

  console.log(`In your park, there are currently ${getPeeps().length} peeps`);
  console.log(`${getStaff().length} of them is your staff.`);

  console.log('Your staff consists of:');
  console.log(`- ${getHandymen().length} handymen`);
  console.log(`- ${getMechanics().length} mechanics`);
  console.log(`- ${getSecurity().length} security`);
  console.log(`- ${getEntertainers().length} entertainers`);
};

export default main;
