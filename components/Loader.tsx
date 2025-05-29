import { Box, Icon, useColorModeValue } from '@chakra-ui/react';
import { FaThumbsUp } from "react-icons/fa";

  const Loader = () => {
    const colorMode = useColorModeValue('grey.900', '#62cff7');
  
    return (
      <Box
        display="inline-block"
        animation="coinFlip 1.5s infinite"
        transformOrigin="center"
        fontSize="80px"
        color={colorMode}
      >
        <Icon as={FaThumbsUp} />
      </Box>
    );
  };
export default Loader;
