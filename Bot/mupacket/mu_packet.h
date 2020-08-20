
/* <><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>*\
 *  Author: Evolver (ninzya@inbox.lv)
 *  Skype: ninzjo
 *
 * <><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>*/

#ifndef __EVOL_MUAPI_MU_PACKET_H__
#define __EVOL_MUAPI_MU_PACKET_H__

#include <memory.h>

#define MU_PACKET( buf_ptr) (muPacket*)buf_ptr
#define MU_REFPKT( pkt_ptr) (*pkt_ptr)

class muPacket {
public:
  // ...
  muPacket() {
  }
  // ...
  ~muPacket() {
  }
public:
  // ...
  inline unsigned char* packet() {
    return ((unsigned char*)this);
  }
  // ...
  inline unsigned char& packet( unsigned short i) {
    return ((unsigned char*)this)[i];
  }
  // ...
  inline void packet( void* out_buf, unsigned short offset, unsigned short bytes) {
    memcpy( out_buf, &this->packet()[offset], bytes);
  }
  // ...
  inline unsigned char hdr() {
    return this->packet()[0];
  }
  // ...
  unsigned short size() {
    unsigned char* buf =(unsigned char*)this;
    if( buf[0] ==0xC1 || buf[0] ==0xC3)
      return (unsigned short)buf[1];
    else if( buf[0] ==0xC2 || buf[0] ==0xC4)
      return (((unsigned short)buf[1] << 8) | (unsigned short)buf[2]);
    // shouldn't occur
    return 0;
  }
  // ...
  inline unsigned char *contents() {
    return &(this->packet()[this->hdrSize()]);
  }
  // ...
  inline unsigned char& contents( unsigned short i) {
    return this->packet()[this->hdrSize()+i];
  }
  // ...
  inline void contents( void* out_buf, unsigned short offset, unsigned short bytes) {
    memcpy( out_buf, &(this->contents()[offset]), bytes);
  }
  // ...
  inline unsigned short contentSize() {
    return( this->size() -this->hdrSize());
  }
  // ...
  inline unsigned char opc() {
    return( this->operator()( 0));
  }
  // ...
  unsigned char hdrSize() {
    unsigned char* buf =(unsigned char*)this;
    if( buf[0] ==0xC1 || buf[0] ==0xC3)
      return 2;
    else if( buf[0] ==0xC2 || buf[0] ==0xC4)
      return 3;
    // shouldn't occur
    return 0;
  }
public:// operators
  // iterates whole packet
  inline unsigned char& operator[]( unsigned short i) {
    return this->packet()[i];
  }
  // iterates contents
  inline unsigned char& operator()( unsigned short i) {
    return this->packet()[i +this->hdrSize()];
  }
  // returns pointer to packet
  inline operator unsigned char*() {
    return this->packet();
  }
};

// checks whether the given packet is valid
bool IsMuPacketValid( unsigned char *ptr, unsigned short len);

#endif