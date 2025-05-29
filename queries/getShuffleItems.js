import { gql } from '@apollo/client'

export default gql`
subscription Shuffle {
    queryShuffle(filter: {claimed: false}) {
        id
        asset_id
        claimed
    }
}`