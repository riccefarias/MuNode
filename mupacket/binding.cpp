#ifndef _HAS_EXCEPTIONS
#define _HAS_EXCEPTIONS 0
#endif

///
/// Warnings
///

#ifdef __WIN32
#pragma warning(disable: 4530, 4267, 4506, 4230, 4506)
#endif

///
/// Includes
///

#include <vector>
#include <node.h>
#include <node_buffer.h>
#include <v8.h>
#include "encdec.h"


///
/// Namespaces
///

using namespace v8;
using namespace node;

///
/// Macros
///

#define V8_CHECK_ARGUMENT_COUNT(n) \
    HandleScope scope; \
    if (args.Length() < n) { \
        return ThrowException(Exception::TypeError(String::New("This function receives " #n " parameters."))); \
    }

#define V8_CHECK_ARGUMENT(n, method) \
    if (!args[n]->Is##method##()) { \
        return ThrowException(Exception::TypeError(String::New("Argument " #n " must be " #method))); \
    }

///
/// Methods
///



unsigned int dec_dat[16];
unsigned int enc_dat[16];

unsigned int cdec_dat[16];
unsigned int cenc_dat[16];


unsigned char out_key[2048];
unsigned char out_key2;



Handle<Value> node_packet_server_encode(const Arguments& args)
{

    V8_CHECK_ARGUMENT_COUNT(2)
    V8_CHECK_ARGUMENT(0, Object)
    V8_CHECK_ARGUMENT(1, Number)
	
	unsigned char outbuf[2048];
	
  

    Local<Object> buffer = args[0]->ToObject();
    int32_t serial = args[1]->Int32Value();
    unsigned char* buffer_ptr = (unsigned char*) node::Buffer::Data(buffer);
    int length = (int) node::Buffer::Length(buffer);
	
	if(!MU_EncodeC3C4(outbuf, MU_PACKET(buffer_ptr), enc_dat, serial)){
	
		Local<Object> ret = Object::New();
		ret->Set(String::New("serial"), Integer::New(-1));
        return scope.Close(ret);	
	}
	
	int s = 0;
	if(outbuf[0]==0xC3){
		s = (outbuf[1] & 0xFF);
	}else{
		s= outbuf[1] * 256;
		s|= outbuf[2];
	}
	

    Local<Object> globalObj = Context::GetCurrent()->Global();
    Local<Function> bufferConstructor = Local<Function>::Cast(globalObj->Get(String::New("Buffer")));
    Handle<Value> constructorArgs[1] = { v8::Integer::New(s)};
    Local<Object> actualBuffer = bufferConstructor->NewInstance(1, constructorArgs);
    memcpy(Buffer::Data(actualBuffer), outbuf, s);
	
	
		Local<Object> ret = Object::New();
    ret->Set(String::New("serial"), Integer::New(1));
    ret->Set(String::New("buffer"), actualBuffer);
	
    return scope.Close(ret);
}


Handle<Value> node_packet_server_decode(const Arguments& args)
{

    V8_CHECK_ARGUMENT_COUNT(1)
    V8_CHECK_ARGUMENT(0, Object)
	
	unsigned char outbuf[2048];
	
	


    Local<Object> buffer = args[0]->ToObject();
    unsigned char* buffer_ptr = (unsigned char*) node::Buffer::Data(buffer);
    int length = (int) node::Buffer::Length(buffer);
	int serial = -1;
	if(!MU_DecodeC3C4(outbuf, MU_PACKET(buffer_ptr), dec_dat, serial)){
	
		Local<Object> ret = Object::New();
		ret->Set(String::New("serial"), Integer::New(-1));
        return scope.Close(ret);	
	}
	
	
	
	int s = 0;
	if(outbuf[0]==0xC1){
		s = (outbuf[1] & 0xFF);
	}else{
		s= outbuf[1] * 256;
		s|= outbuf[2];
	}
	

    Local<Object> globalObj = Context::GetCurrent()->Global();
    Local<Function> bufferConstructor = Local<Function>::Cast(globalObj->Get(String::New("Buffer")));
    Handle<Value> constructorArgs[1] = { v8::Integer::New(s)};
    Local<Object> actualBuffer = bufferConstructor->NewInstance(1, constructorArgs);
    memcpy(Buffer::Data(actualBuffer), outbuf, s);
	
	
		Local<Object> ret = Object::New();
    ret->Set(String::New("serial"), Integer::New(serial));
    ret->Set(String::New("buffer"), actualBuffer);
	
    return scope.Close(ret);
}









//========CLIENT ============
//========CLIENT ============
//========CLIENT ============
//========CLIENT ============
//========CLIENT ============
//========CLIENT ============
//========CLIENT ============


Handle<Value> node_packet_client_encode(const Arguments& args)
{

    V8_CHECK_ARGUMENT_COUNT(2)
    V8_CHECK_ARGUMENT(0, Object)
    V8_CHECK_ARGUMENT(1, Number)
	
	unsigned char outbuf[2048];
	
  

    Local<Object> buffer = args[0]->ToObject();
    int32_t serial = args[1]->Int32Value();
    unsigned char* buffer_ptr = (unsigned char*) node::Buffer::Data(buffer);
    int length = (int) node::Buffer::Length(buffer);
	
	if(!MU_EncodeC3C4(outbuf, MU_PACKET(buffer_ptr), cenc_dat, serial)){
	
		Local<Object> ret = Object::New();
		ret->Set(String::New("serial"), Integer::New(-1));
        return scope.Close(ret);	
	}
	
	int s = 0;
	if(outbuf[0]==0xC3){
		s = (outbuf[1] & 0xFF);
	}else{
		s= outbuf[1] * 256;
		s|= outbuf[2];
	}
	

    Local<Object> globalObj = Context::GetCurrent()->Global();
    Local<Function> bufferConstructor = Local<Function>::Cast(globalObj->Get(String::New("Buffer")));
    Handle<Value> constructorArgs[1] = { v8::Integer::New(s)};
    Local<Object> actualBuffer = bufferConstructor->NewInstance(1, constructorArgs);
    memcpy(Buffer::Data(actualBuffer), outbuf, s);
	
	
		Local<Object> ret = Object::New();
    ret->Set(String::New("serial"), Integer::New(1));
    ret->Set(String::New("buffer"), actualBuffer);
	
    return scope.Close(ret);
}


Handle<Value> node_packet_client_decode(const Arguments& args)
{

    V8_CHECK_ARGUMENT_COUNT(1)
    V8_CHECK_ARGUMENT(0, Object)
	
	unsigned char outbuf[2048];
	
	


    Local<Object> buffer = args[0]->ToObject();
    unsigned char* buffer_ptr = (unsigned char*) node::Buffer::Data(buffer);
    int length = (int) node::Buffer::Length(buffer);
	int serial = -1;
	if(!MU_DecodeC3C4(outbuf, MU_PACKET(buffer_ptr), cdec_dat, serial)){
	
		Local<Object> ret = Object::New();
		ret->Set(String::New("serial"), Integer::New(-1));
        return scope.Close(ret);	
	}
	
	
	
	int s = 0;
	if(outbuf[0]==0xC1){
		s = (outbuf[1] & 0xFF);
	}else{
		s= outbuf[1] * 256;
		s|= outbuf[2];
	}
	

    Local<Object> globalObj = Context::GetCurrent()->Global();
    Local<Function> bufferConstructor = Local<Function>::Cast(globalObj->Get(String::New("Buffer")));
    Handle<Value> constructorArgs[1] = { v8::Integer::New(s)};
    Local<Object> actualBuffer = bufferConstructor->NewInstance(1, constructorArgs);
    memcpy(Buffer::Data(actualBuffer), outbuf, s);
	
	
		Local<Object> ret = Object::New();
    ret->Set(String::New("serial"), Integer::New(serial));
    ret->Set(String::New("buffer"), actualBuffer);
	
    return scope.Close(ret);
}













///
/// Module register
///

void RegisterModule(v8::Handle<v8::Object> target)
{
	
	MuReadEncfile( "Dec1.dat", dec_dat );
	MuReadEncfile( "Enc2.dat", enc_dat );
	
	
	
	MuReadEncfile( "Dec2.dat", cdec_dat );
	MuReadEncfile( "Enc1.dat", cenc_dat );
	
	
	//char w[50];  
	//sprintf(w,"%X",r);
	//MessageBox(HWND_DESKTOP,w,"ok ok",MB_OK);
	
    NODE_SET_METHOD(target, "server_encode", node_packet_server_encode);
    NODE_SET_METHOD(target, "server_decode", node_packet_server_decode);
	
	
    NODE_SET_METHOD(target, "client_encode", node_packet_client_encode);
    NODE_SET_METHOD(target, "client_decode", node_packet_client_decode);
}

///
/// Node module
///

NODE_MODULE(munet, RegisterModule);