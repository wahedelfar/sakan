import { headers } from 'next/headers';
import TenantHome from './components/TenantHome';
import SaaSLanding from './components/SaaSLanding';

export default function Home(){
  const host=headers().get('host')?.split(':')[0].toLowerCase()||'';
  const isSaaS=host==='egarat.online'||host==='www.egarat.online';
  return isSaaS?<SaaSLanding/>:<TenantHome/>;
}
