
/* <><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>*\
 *  Author: Evolver (ninzya@inbox.lv)
 *  Skype: ninzjo
 *
 * <><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>*/

#include "mu_packet.h"

// checks whether the given packet is valid
bool IsMuPacketValid( unsigned char *ptr, unsigned short len) {
	if( len < 3) return false;
	if( ptr[0] == 0xC1 || ptr[0] == 0xC3)
		return ( ptr[1] == len);
	else if (ptr[0] == 0xC2 || ptr[0] == 0xC4) {
		unsigned short inlen =(unsigned short)ptr[1] << 8 | (unsigned short)ptr[2];
		return ( inlen == len);
	} else
		return false;
}