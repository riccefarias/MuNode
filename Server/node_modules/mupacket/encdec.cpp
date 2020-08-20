 /*
 * Mu Protocol Decryption algorythm fetched from gs by wad. Special thanks.
 * Author: Evolver
 * Modifications:
 *  Integrated encryption algorhythm basing on decryption algorhythm by wad. (Evolver)
 *  Prepared and tested code (Evolver)
 */

#include "encdec.h"
#include "mu_packet.h"
#include <memory.h>
#include <cstdio>

#include "windows.h"

// MuError.log
const static unsigned int xor_tab_muerror[4] = {
	0x9F81BD7C, 0x56E2933D, 0x3ED2732A, 0xBF9583F2
};
// used to decrypt login and password, Terrain*.att files in
// client-side Data/World*/
const static unsigned char xor_table_3byte[3] = {
	0xFC, 0xCF, 0xAB
};
// used to decrypt client-side Data/Enc1.dat and Data/Dec2.Dat
const unsigned int xor_tab_datfile[4] = { 
  0x3F08A79B, 0xE25CC287, 0x93D27AB9, 0x20DEA7BF
};
// used to decrypt C1/C2 packets
const unsigned char xor_tab_C1C2[32] = {
  0xE7, 0x6D, 0x3A, 0x89, 0xBC, 0xB2, 0x9F, 0x73,
	0x23, 0xA8, 0xFE, 0xB6, 0x49, 0x5D, 0x39, 0x5D,
	0x8A, 0xCB, 0x63, 0x8D, 0xEA, 0x7D, 0x2B, 0x5F,
	0xC3, 0xB1, 0xE9, 0x83, 0x29, 0x51, 0xE8, 0x56
};
// decrypts login/passwod, and also used to decrypt login and password,
// Terrain*.att files in client-side Data/World*/
void MuXor3Byte( unsigned char* ptr, unsigned int len) {
	for( unsigned int i = 0; i < len; ++i)
		ptr[i] ^= xor_table_3byte[i%3];
}
// ...
void ShiftRight(unsigned char* ptr, unsigned int len, unsigned int shift) {
	if (shift == 0) return;
	for( unsigned int i = 1; i < len; ++i) {
		*ptr = (*ptr << shift) | (*(ptr+1) >> (8 - shift));
		++ptr;
	}
	*ptr <<= shift;
}
// ...
void ShiftLeft(unsigned char* ptr, unsigned int len, unsigned int shift) {
	if (shift == 0) return;
	ptr +=len -1;
	for( unsigned int i = 1; i < len; ++i) {
		*ptr = (*ptr >> shift) | (*(ptr-1) << (8 - shift));
		--ptr;
	}
	*ptr >>= shift;
}
// ...
unsigned int ShiftBytes(unsigned char* buf, unsigned int arg_4, unsigned char* pkt, unsigned int arg_C, unsigned int arg_10) {
	unsigned int size_ = ((((arg_10 + arg_C) - 1) / 8) + (1 - (arg_C / 8)));
  unsigned char tmp1[20] ={ 0 };
	memcpy( tmp1, &pkt[arg_C /8], size_);
	unsigned int var_4 = (arg_10 + arg_C) & 0x7;
	if (var_4) tmp1[size_ - 1] &= 0xFF << (8 - var_4);
	arg_C &= 0x7;
	ShiftRight(tmp1, size_, arg_C);
	ShiftLeft(tmp1, size_ + 1, arg_4 & 0x7);
	if ((arg_4 & 0x7) > arg_C)
		++size_;
	if(size_)
		for( unsigned int i =0; i < size_; ++i)
			buf[i+(arg_4/8)] |=tmp1[i];
	return arg_10 + arg_4;
}
// ...
void Encode8BytesTo11Bytes( unsigned char* outbuf, unsigned char* pktptr, unsigned int num_bytes, unsigned int* dec_dat) {
  unsigned char finale[2];
	finale[0] =(unsigned char)num_bytes;
	finale[0] ^= 0x3D;
	finale[1] =0xF8;
	for (int k = 0; k < 8; ++k)
		finale[1] ^= pktptr[k];
	finale[0] ^= finale[1];
  ShiftBytes( outbuf, 0x48, finale, 0x00, 0x10);
  unsigned int ring[4] ={ 0x000000000, 0x00000000, 0x00000000, 0x00000000 };
	unsigned short* cryptbuf =(unsigned short*)pktptr;
  ring[0] =((dec_dat[ 8] ^(cryptbuf[0])) *dec_dat[ 4]) %dec_dat[ 0];
  ring[1] =((dec_dat[ 9] ^(cryptbuf[1] ^(ring[0] &0xFFFF))) *dec_dat[ 5]) %dec_dat[ 1];
  ring[2] =((dec_dat[10] ^(cryptbuf[2] ^(ring[1] &0xFFFF))) *dec_dat[ 6]) %dec_dat[ 2];
  ring[3] =((dec_dat[11] ^(cryptbuf[3] ^(ring[2] &0xFFFF))) *dec_dat[ 7]) %dec_dat[ 3];
  unsigned int ring_backup[4] ={ ring[0], ring[1], ring[2], ring[3] };
  ring[2] =ring[2] ^dec_dat[10] ^(ring_backup[3] &0xFFFF);
  ring[1] =ring[1] ^dec_dat[ 9] ^(ring_backup[2] &0xFFFF);
  ring[0] =ring[0] ^dec_dat[ 8] ^(ring_backup[1] &0xFFFF);
  ShiftBytes( outbuf, 0x00, (unsigned char*)(&ring[0]), 0x00, 0x10);
  ShiftBytes( outbuf, 0x10, (unsigned char*)(&ring[0]), 0x16, 0x02);
  ShiftBytes( outbuf, 0x12, (unsigned char*)(&ring[1]), 0x00, 0x10);
  ShiftBytes( outbuf, 0x22, (unsigned char*)(&ring[1]), 0x16, 0x02);
  ShiftBytes( outbuf, 0x24, (unsigned char*)(&ring[2]), 0x00, 0x10);
  ShiftBytes( outbuf, 0x34, (unsigned char*)(&ring[2]), 0x16, 0x02);
  ShiftBytes( outbuf, 0x36, (unsigned char*)(&ring[3]), 0x00, 0x10);
  ShiftBytes( outbuf, 0x46, (unsigned char*)(&ring[3]), 0x16, 0x02);
}
// ...
int Decode11BytesTo8Bytes( unsigned char* outbuf, unsigned char* pktptr, unsigned int* dec_dat) {
  unsigned int ring[4] ={ 0x00000000, 0x00000000, 0x00000000, 0x00000000 };
	ShiftBytes((unsigned char*)&ring[0], 0x00, pktptr, 0x00, 0x10);
	ShiftBytes((unsigned char*)&ring[0], 0x16, pktptr, 0x10, 0x02);
	ShiftBytes((unsigned char*)&ring[1], 0x00, pktptr, 0x12, 0x10);
	ShiftBytes((unsigned char*)&ring[1], 0x16, pktptr, 0x22, 0x02);
	ShiftBytes((unsigned char*)&ring[2], 0x00, pktptr, 0x24, 0x10);
	ShiftBytes((unsigned char*)&ring[2], 0x16, pktptr, 0x34, 0x02);
	ShiftBytes((unsigned char*)&ring[3], 0x00, pktptr, 0x36, 0x10);
	ShiftBytes((unsigned char*)&ring[3], 0x16, pktptr, 0x46, 0x02);
	ring[2] =ring[2] ^dec_dat[10] ^(ring[3] &0xFFFF);
	ring[1] =ring[1] ^dec_dat[ 9] ^(ring[2] &0xFFFF);
	ring[0] =ring[0] ^dec_dat[ 8] ^(ring[1] &0xFFFF);
	unsigned short* cryptbuf =(unsigned short*)outbuf;
	cryptbuf[0] =dec_dat[ 8] ^((ring[0] *dec_dat[ 4]) %dec_dat[0]);
	cryptbuf[1] =dec_dat[ 9] ^((ring[1] *dec_dat[ 5]) %dec_dat[1]) ^(ring[0] &0xFFFF);
	cryptbuf[2] =dec_dat[10] ^((ring[2] *dec_dat[ 6]) %dec_dat[2]) ^(ring[1] &0xFFFF);
	cryptbuf[3] =dec_dat[11] ^((ring[3] *dec_dat[ 7]) %dec_dat[3]) ^(ring[2] &0xFFFF);
  unsigned char finale[2] ={ 0x00, 0x00 };
	ShiftBytes(finale, 0, pktptr, 0x48, 0x10);
	finale[0] ^= finale[1];
	finale[0] ^= 0x3D;
	unsigned char m = 0xF8;
	for( int k = 0; k < 8; ++k)
		m ^= outbuf[k];
	if( m ==finale[1])
		return finale[0];
	return -1;
}
// ...
inline unsigned short MuPacketEncSpace( muPacket* pkt) {
  return((( pkt->contentSize() /8) +(((pkt->contentSize() %8) >0) ? 1 : 0)) *11) +pkt->hdrSize();
}
// ...
inline unsigned short MuPacketDecSpace( muPacket* pkt) {
  return(( pkt->contentSize() /11) *8) +pkt->hdrSize() -1;
}
// (if C1, offset = 2), (if C2, offset = 3)
void MU_ForceEncodeC1C2(unsigned char* outbuf, unsigned char* buf, unsigned short len, unsigned short offset =2) {
	for( unsigned short p =1; p < len; ++p)
		buf[p] ^= buf[p-1] ^ xor_tab_C1C2[(p+offset) %32];
}
// (if C1, offset = 2), (if C2, offset = 3)
void MU_ForceDecodeC1C2( unsigned char* buf, unsigned short len, unsigned short offset =2) {
	--len;
	for( unsigned short p =len; p > 0; --p)
		buf[p] ^= buf[p-1] ^ xor_tab_C1C2[(p+offset) %32];
}
// encode c1/c2 packet
inline void MU_EncodeC1C2(unsigned char* outbuf, muPacket* packet) {
  MU_ForceEncodeC1C2(outbuf, packet->contents(), packet->contentSize(), packet->hdrSize());
}
// decode c1/c2 packet
inline void MU_DecodeC1C2( muPacket* packet) {
  MU_ForceDecodeC1C2( packet->contents(), packet->contentSize(), packet->hdrSize());
}
// encode c3/c4 packet
bool MU_ForceEncodeC3C4( unsigned char* outbuf, unsigned short* outlen, unsigned char* inbuf, unsigned short len, unsigned int* dec_dat) {
  *outlen =0;
  unsigned int offset =0;
	for( offset =0; (offset+8) <= len; offset +=8) {
		memset( outbuf, 0, 11);
		Encode8BytesTo11Bytes( outbuf, &inbuf[offset], 8, dec_dat);
		*outlen += 11;
		outbuf += 11;
	}
	if ( offset < len) {
		memset( outbuf, 0, 11);
		Encode8BytesTo11Bytes( outbuf, &inbuf[offset], len - offset, dec_dat);
		*outlen += 11;
	}
	return true;
}
// decode c3/c4 packet
bool MU_ForceDecodeC3C4( unsigned char* outbuf, unsigned short* outlen, unsigned char* inbuf, unsigned short len, unsigned int* dec_dat) {
	if ((len % 11) != 0)
    return false;// invalid size specified
  *outlen = 0;
  int rez =0;
	for( unsigned int offset =0; offset < len; offset +=11) {
		rez =Decode11BytesTo8Bytes( outbuf, &inbuf[offset], dec_dat);
		if (rez <= 0)
      return false;// failed to decrypt
		*outlen +=(unsigned int)rez;
		outbuf +=8;
	}
	return true;
}
// decrypt c3/c4 packet
bool MU_DecodeC3C4( unsigned char* outbuf, muPacket* pkt, unsigned int* dec_dat, int & dec_key) {
  unsigned char hdrSize =pkt->hdrSize();
  unsigned char hdr =pkt->hdr();
  unsigned short dec_size =0;
  if( MU_ForceDecodeC3C4( &outbuf[hdrSize -1], &dec_size, pkt->contents(), pkt->contentSize(), dec_dat) ==false)
    return false;// decryption fails
  dec_size +=hdrSize -1;
  dec_key =outbuf[hdrSize -1];
  
    //    Serial = NewPacket[iHeaderSize-1];
  outbuf[0] =hdr -2;
  if( hdrSize ==2)
    outbuf[1] =(unsigned char)dec_size;
  else {
    outbuf[1] =(unsigned char)((dec_size &~0x00FF) >> 8);
    outbuf[2] =(unsigned char)(dec_size &~0xFF00);
  }
  return true;// decrypt success
}
// encrypt c3/c4 packet
bool MU_EncodeC3C4( unsigned char* outbuf, muPacket* pkt, unsigned int* dec_dat, unsigned char enc_key) {
  unsigned char hdrSize =pkt->hdrSize();
  unsigned char hdr =pkt->hdr();
  unsigned short size =pkt->size();
  unsigned char tmp =pkt->packet( hdrSize -1);

  


  unsigned short enc_len =0;
  pkt->packet( hdrSize -1) =enc_key;
  bool rs =MU_ForceEncodeC3C4( &outbuf[hdrSize], &enc_len, &pkt->packet( hdrSize -1), size -hdrSize +1, dec_dat);
  pkt->packet( hdrSize -1) =tmp;
  if( rs ==true) {
    outbuf[0] =hdr +2;
    enc_len +=hdrSize;
    if( hdrSize ==2)
      outbuf[1] =(unsigned char)enc_len;
    else {
      outbuf[1] =(unsigned char)((enc_len &~0x00FF) >> 8);
      outbuf[2] =(unsigned char)(enc_len &~0xFF00);
    }
  }
  return rs;
}
// out_dat element count = 16
MuReadEncfileResult_t MuReadEncfile( char *file, unsigned int* out_dat ) {
	FILE* stream =fopen( file, "rb");
  if( stream ==0)
    return MuReadEncfile_InvalidPath;
	fseek( stream, 0, SEEK_END);
  long size =ftell( stream);
  if( size !=54)
    return MuReadEncfile_FileCorrupted;
  fseek( stream, 6, SEEK_SET);
  unsigned int buf[4];
  fread( buf, 4, 4, stream);
	out_dat[ 0] = buf[0] ^ xor_tab_datfile[0];
	out_dat[ 1] = buf[1] ^ xor_tab_datfile[1];
	out_dat[ 2] = buf[2] ^ xor_tab_datfile[2];
	out_dat[ 3] = buf[3] ^ xor_tab_datfile[3];
	fread( buf, 4, 4, stream);
	out_dat[ 4] = buf[0] ^ xor_tab_datfile[0];
	out_dat[ 5] = buf[1] ^ xor_tab_datfile[1];
	out_dat[ 6] = buf[2] ^ xor_tab_datfile[2];
	out_dat[ 7] = buf[3] ^ xor_tab_datfile[3];
	fread( buf, 4, 4, stream);
	out_dat[ 8] = buf[0] ^ xor_tab_datfile[0];
	out_dat[ 9] = buf[1] ^ xor_tab_datfile[1];
	out_dat[10] = buf[2] ^ xor_tab_datfile[2];
	out_dat[11] = buf[3] ^ xor_tab_datfile[3];
  fclose( stream);


	return MuReadEncfile_Success;
}