import "./Header.scss";

import logo from "../../assets/images/logo.png";

function Header () {
    return (
        <nav className="header">
            <img className="header__logo" src={logo}></img>
        </nav>
    )
}

export default Header;;