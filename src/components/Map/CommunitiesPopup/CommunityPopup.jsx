import './CommunityPopup.css'
import PropTypes from 'prop-types'

function CommunityPopup ({ id , position }) {

  return (
    <div className='community-popup' id={id} style={{left:position[0], bottom:position[1]}}>

    </div>
  )

}

CommunityPopup.propTypes = {
  id: PropTypes.string.isRequired,
  position: PropTypes.arrayOf(PropTypes.number).isRequired
}

export default CommunityPopup