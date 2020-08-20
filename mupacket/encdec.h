 /*
 * Mu Protocol Decryption algorythm fetched from gs by wad. Special thanks.
 * Author: Evolver
 * Modifications:
 *  Integrated encryption algorhythm basing on decryption algorhythm by wad. (Evolver)
 *  Prepared and tested code (Evolver)
 */

#ifndef __EVOL_MUAPI_MU_ENCDEC_H__
#define __EVOL_MUAPI_MU_ENCDEC_H__

#include "mu_packet.h"

enum MuReadEncfileResult_t {
  MuReadEncfile_InvalidPath =0,
  MuReadEncfile_FileCorrupted =1,
  MuReadEncfile_Success =2
};

// this algorythm uses dec data in this order:
//  enc client->server (Dec1.dat)
//  dec client->server (Dec1.dat)
//  enc server->client (Dec2.dat)
//  dec server->client (Dec2.dat)

// reads encryption file
MuReadEncfileResult_t MuReadEncfile( char *file, unsigned int* out_dat );
// decrypts login/passwod, and also used to decrypt login and password,
// Terrain*.att files in client-side Data/World*/, bmd files
void MuXor3Byte( unsigned char* ptr, unsigned int len);
// encode c1/c2 packet
extern void MU_EncodeC1C2(unsigned char* outbuf, muPacket* packet);
// decode c1/c2 packet
extern void MU_DecodeC1C2( muPacket* packet);
// encode c3/c4 packet
bool MU_EncodeC3C4( unsigned char* outbuf, muPacket* pkt, unsigned int* dec_dat, unsigned char enc_key);
// decode c3/c4 packet
bool MU_DecodeC3C4( unsigned char* outbuf, muPacket* pkt, unsigned int* dec_dat, int & dec_key);
// returns space in bytes, required to fit the encrypted packet to c3/c4
extern unsigned short MuPacketEncSpace( muPacket* pkt);
// returns space in bytes, required to fit the decrypted packet from c3/c4
extern unsigned short MuPacketDecSpace( muPacket* pkt);

#endif