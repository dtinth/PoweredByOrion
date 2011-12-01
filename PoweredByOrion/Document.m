//
//  Document.m
//  PoweredByOrion
//
//  Created by the DtTvB on 12/1/11.
//  Copyright (c) 2011 __MyCompanyName__. All rights reserved.
//

#import "Document.h"

@implementation Document

- (id)init {
    self = [super init];
    if (self) {
		if (text == nil) {
			text = @"";
		}
		frameLoaded = false;
		queuedEditorText = nil;
    }
    return self;
}

@synthesize text;

+ (BOOL)isSelectorExcludedFromWebScript:(SEL)aSelector {
	if (aSelector == @selector(textChanged)) return NO;
	if (aSelector == @selector(getInitialText)) return NO;
	if (aSelector == @selector(getInitialFilename)) return NO;
	if (aSelector == @selector(setDirtyFlag)) return NO;
	return YES;
}

- (void)setDirtyFlag {
	NSNumber *flag = [[webView windowScriptObject] callWebScriptMethod:@"getDirty" withArguments:[NSArray array]];
	if (flag) {
		[self updateChangeCount:NSChangeDone];
	} else {
		[self updateChangeCount:NSChangeCleared];
	}
}

- (NSString *)getInitialText {
	NSString *t = queuedEditorText;
	if (t == nil) t = @"";
	queuedEditorText = nil;
	frameLoaded = true;
	return t;
}

- (NSString *)getInitialFilename {
	return [[self fileURL] lastPathComponent];
}

- (void)setEditorText:(NSString *)newEditorText {
	if (frameLoaded) {
		[[webView windowScriptObject] callWebScriptMethod:@"setText" withArguments:[NSArray arrayWithObject:newEditorText]];
	} else {
		queuedEditorText = newEditorText;
	}
}

- (void)textChanged {
	NSString *editorText = [self getEditorText];
	[self setText:editorText];
}

- (NSString *)getEditorText {
	if (!frameLoaded) return nil;
	return [[webView windowScriptObject] callWebScriptMethod:@"getText" withArguments:[NSArray array]];
}

- (NSString *)windowNibName {
	return @"Document";
}

- (void)windowControllerDidLoadNib:(NSWindowController *)aController {
	[super windowControllerDidLoadNib:aController];
	if (text != nil) {
		[self setEditorText:text];
	}
	[[webView windowScriptObject] setValue:self forKey:@"pbo"];
	[[webView mainFrame] loadRequest:[NSURLRequest requestWithURL:[[NSBundle mainBundle] URLForResource:@"editor.html" withExtension:nil]]];
}

- (NSData *)dataOfType:(NSString *)typeName error:(NSError **)outError {
	[self setText:[self getEditorText]];
	return [[self text] dataUsingEncoding:NSUTF8StringEncoding];
}

- (BOOL)readFromData:(NSData *)data ofType:(NSString *)typeName error:(NSError **)outError {
	NSString *str = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
	if (str != nil) {
		[self setText:str];
		return YES;
	}
	return NO;
}

+ (BOOL)autosavesInPlace {
    return YES;
}

- (void)webView:(WebView *)sender didFinishLoadForFrame:(WebFrame *)frame {
	// nuffink
}

@end
