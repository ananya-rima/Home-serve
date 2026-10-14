import { Outlet } from 'react-router-dom';


const PublicPageContainer = () => (
  <div className="container-page py-8 sm:py-10">
    <Outlet />
  </div>
);

export default PublicPageContainer;
