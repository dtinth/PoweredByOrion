//
//  Document.h
//  PoweredByOrion
//
//  Created by the DtTvB on 12/1/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

@interface Document : NSDocument
{
	IBOutlet WebView *webView;
	NSString *text;
	NSString *queuedEditorText;
	BOOL frameLoaded;
}

@property(strong) NSString *text;
+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector;
- (void)textChanged;
- (void)setEditorText:(NSString *)newEditorText;
- (NSString *)getEditorText;

@end
